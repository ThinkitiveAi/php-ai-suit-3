import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProviderAppointments.css'

const API_BASE = 'http://localhost:8001/api'

const ProviderAppointments = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('auth_token')
  
  const [appointments, setAppointments] = useState({})
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    appointment_type: ''
  })

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadAppointments()
    loadStatistics()
  }, [filters])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const res = await fetch(`${API_BASE}/provider/appointments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const data = await res.json()
      if (data.success) {
        setAppointments(data.data.appointments)
      } else {
        setError(data.message || 'Failed to load appointments')
      }
    } catch (e) {
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const res = await fetch(`${API_BASE}/provider/appointments/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const data = await res.json()
      if (data.success) {
        setStatistics(data.data)
      }
    } catch (e) {
      // ignore
    }
  }

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/provider/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        loadAppointments()
        loadStatistics()
      } else {
        setError(data.message || 'Failed to update status')
      }
    } catch (e) {
      setError('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3B82F6',
      arrived: '#10B981',
      in_progress: '#F59E0B',
      completed: '#059669',
      canceled: '#EF4444',
      no_show: '#6B7280',
      rescheduled: '#8B5CF6'
    }
    return colors[status] || '#6B7280'
  }

  const formatTime = (time) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  return (
    <div className="provider-appointments">
      <div className="pa-header">
        <div className="pa-title">
          <h1>My Appointments</h1>
          <p>View and manage your patient appointments</p>
        </div>
        <button className="pa-back" onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      {error && <div className="pa-alert pa-alert-error">{error}</div>}

      {/* Statistics */}
      <div className="pa-stats">
        <div className="stat-card">
          <h3>Today</h3>
          <div className="stat-numbers">
            <span className="stat-main">{statistics.today?.total || 0}</span>
            <span className="stat-sub">Total</span>
          </div>
          <div className="stat-details">
            <span>Scheduled: {statistics.today?.scheduled || 0}</span>
            <span>Completed: {statistics.today?.completed || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <h3>This Week</h3>
          <div className="stat-numbers">
            <span className="stat-main">{statistics.this_week?.total || 0}</span>
            <span className="stat-sub">Appointments</span>
          </div>
        </div>
        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-numbers">
            <span className="stat-main">{statistics.this_month?.total || 0}</span>
            <span className="stat-sub">Appointments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="pa-filters">
        <label>
          From
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="arrived">Arrived</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="no_show">No Show</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </label>
        <label>
          Type
          <select
            value={filters.appointment_type}
            onChange={(e) => setFilters(prev => ({ ...prev, appointment_type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency">Emergency</option>
            <option value="routine_checkup">Routine Checkup</option>
            <option value="specialist_consultation">Specialist Consultation</option>
          </select>
        </label>
      </div>

      {/* Appointments List */}
      <div className="pa-content">
        <div className="pa-appointments">
          <div className="pa-section-title">Appointments</div>
          
          {loading ? (
            <div className="pa-skeleton wide" />
          ) : Object.keys(appointments).length === 0 ? (
            <div className="pa-empty">No appointments found for the selected filters.</div>
          ) : (
            Object.entries(appointments).map(([date, dateAppointments]) => (
              <div key={date} className="pa-date-group">
                <h3 className="pa-date-header">{new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</h3>
                
                <div className="pa-appointment-list">
                  {dateAppointments.map(appointment => (
                    <div key={appointment.id} className="pa-appointment-card">
                      <div className="pa-appointment-time">
                        <div className="pa-time">
                          {formatTime(appointment.slot?.start_time)} - {formatTime(appointment.slot?.end_time)}
                        </div>
                        <div className="pa-type">{appointment.slot?.appointment_type?.replace('_', ' ') || 'Consultation'}</div>
                      </div>
                      
                      <div className="pa-patient-info">
                        <div className="pa-patient-name">
                          {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </div>
                        <div className="pa-patient-id">ID: {appointment.patient?.patient_id}</div>
                        <div className="pa-patient-contact">
                          📧 {appointment.patient?.email} | 📞 {appointment.patient?.phone}
                        </div>
                      </div>
                      
                      <div className="pa-appointment-actions">
                        <div className="pa-status">
                          <span 
                            className="pa-status-badge"
                            style={{ backgroundColor: getStatusColor(appointment.status) }}
                          >
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <select
                          value={appointment.status}
                          onChange={(e) => updateStatus(appointment.id, e.target.value)}
                          disabled={loading}
                          className="pa-status-select"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="arrived">Arrived</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="canceled">Canceled</option>
                          <option value="no_show">No Show</option>
                          <option value="rescheduled">Rescheduled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderAppointments 