import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PatientAppointment.css'

const API_BASE = 'http://localhost:8001/api'

const PatientAppointment = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('patient_auth_token')

  const [providers, setProviders] = useState([])
  const [providerId, setProviderId] = useState('')
  const [date, setDate] = useState('')

  const [dayAvailability, setDayAvailability] = useState(null)
  const [slots, setSlots] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/patient/login')
      return
    }
    loadProviders()
  }, [])

  useEffect(() => {
    if (providerId && date) {
      loadDayAvailability(providerId, date)
      loadGeneratedSlots(providerId, date)
    } else {
      setDayAvailability(null)
      setSlots([])
    }
  }, [providerId, date])

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/patient/providers`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      const data = await res.json()
      if (data.success) setProviders(data.data.providers)
      else setError(data.message || 'Failed to load providers')
    } catch (_) {
      setError('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  const loadDayAvailability = async (pid, d) => {
    try {
      const qp = new URLSearchParams({ date: d })
      const res = await fetch(`${API_BASE}/patient/provider/availability/${pid}/by-date?${qp.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      const data = await res.json()
      if (data.success) setDayAvailability(data.data)
      else setDayAvailability(null)
    } catch (_) {
      setDayAvailability(null)
    }
  }

  const loadGeneratedSlots = async (pid, d) => {
    try {
      setLoading(true)
      setError('')
      const qp = new URLSearchParams({ date: d, slot_duration: '30' })
      const res = await fetch(`${API_BASE}/patient/providers/${pid}/generated-slots?${qp.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      const data = await res.json()
      if (data.success) setSlots(data.data.slots)
      else setSlots([])
    } catch (_) {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const bookByTime = async (slot) => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/patient/appointments/book-by-time`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          provider_id: Number(providerId),
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
        })
      })
      const data = await res.json()
      if (data.success) {
        alert('Appointment booked!')
        loadGeneratedSlots(providerId, date)
      } else {
        setError(data.message || 'Failed to book appointment')
      }
    } catch (_) {
      setError('Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patient-appointment">
      <div className="pa-header">
        <div className="pa-title">
          <h1>Book Appointment</h1>
          <p>Select a provider and a date to view available times</p>
        </div>
        <button className="pa-back" onClick={() => navigate('/patient/dashboard')}>Back</button>
      </div>

      {error && <div className="pa-alert pa-alert-error">{error}</div>}

      <div className="pa-filters" style={{ alignItems: 'center' }}>
        <label>
          Provider
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            style={{ marginLeft: '8px', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          >
            <option value="">Select provider</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.specialization}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginLeft: '8px' }}
          />
        </label>
      </div>

      {providerId && date && (
        <div className="pa-alert" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
          {dayAvailability && dayAvailability.is_available ? (
            <span>On {dayAvailability.date} ({dayAvailability.day_of_week}), available {dayAvailability.start_time} - {dayAvailability.end_time} ({dayAvailability.timezone}).</span>
          ) : (
            <span>No availability on {date}.</span>
          )}
        </div>
      )}

      <div className="pa-content" style={{ gridTemplateColumns: '1fr' }}>
        <div className="pa-slots">
          <div className="pa-section-title">Available Slots</div>
          {!providerId || !date ? (
            <div className="pa-empty">Select a provider and date to view slots.</div>
          ) : loading ? (
            <div className="pa-skeleton wide" />
          ) : (slots.length === 0 ? (
            <div className="pa-empty">No slots available for the selected date.</div>
          ) : (
            <div className="pa-slot-list">
              {slots.map(s => (
                <div key={`${s.date}-${s.start_time}`} className="pa-slot-card">
                  <div className="pa-slot-time">
                    <div className="pa-slot-date">{s.date}</div>
                    <div className="pa-slot-range">{(s.start_time||'').substring(0,5)} - {(s.end_time||'').substring(0,5)} ({s.timezone})</div>
                  </div>
                  <div className="pa-slot-actions">
                    <button className="pa-btn primary" onClick={() => bookByTime(s)} disabled={loading}>Book</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatientAppointment 