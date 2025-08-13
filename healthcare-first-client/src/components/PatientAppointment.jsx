import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PatientAppointment.css'

const API_BASE = 'http://localhost:8001/api'

const PatientAppointment = () => {
  const navigate = useNavigate()
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [dayAvailability, setDayAvailability] = useState(null)
  const token = localStorage.getItem('patient_auth_token')

  useEffect(() => {
    if (!token) {
      navigate('/patient/login')
      return
    }
    fetchProviders()
  }, [])

  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchDayAvailability(selectedProvider.id)
      fetchGeneratedSlots(selectedProvider.id)
    }
  }, [selectedDate])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/patient/providers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const data = await res.json()
      if (data.success) {
        setProviders(data.data.providers)
      } else {
        setError(data.message || 'Failed to load providers')
      }
    } catch (e) {
      setError('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  const filteredProviders = providers.filter(p => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      (p.specialization || '').toLowerCase().includes(q) ||
      (p.clinic_name || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q)
    )
  })

  const fetchSlots = async (providerId) => {
    try {
      setLoading(true)
      setError('')
      setSelectedProvider(providers.find(p => p.id === providerId) || null)
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      const qs = params.toString()
      const url = `${API_BASE}/patient/providers/${providerId}/slots${qs ? `?${qs}` : ''}`
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const data = await res.json()
      if (data.success) {
        setSlots(data.data.slots)
      } else {
        setError(data.message || 'Failed to load slots')
      }
    } catch (e) {
      setError('Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  const bookSlot = async (slotId) => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/patient/appointments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ slot_id: slotId })
      })
      const data = await res.json()
      if (data.success) {
        alert('Appointment booked!')
        fetchSlots(selectedProvider.id)
      } else {
        setError(data.message || 'Failed to book appointment')
      }
    } catch (e) {
      setError('Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneratedSlots = async (providerId) => {
    if (!selectedDate) return
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ date: selectedDate, slot_duration: '30' })
      const res = await fetch(`${API_BASE}/patient/providers/${providerId}/generated-slots?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      const data = await res.json()
      if (data.success) {
        setSlots(data.data.slots.map(s => ({ ...s, generated: true })))
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const bookGenerated = async (s) => {
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
          provider_id: selectedProvider.id,
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
        })
      })
      const data = await res.json()
      if (data.success) {
        alert('Appointment booked!')
        if (selectedDate) fetchGeneratedSlots(selectedProvider.id)
        else fetchSlots(selectedProvider.id)
      } else {
        setError(data.message || 'Failed to book appointment')
      }
    } catch (e) {
      setError('Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const fetchDayAvailability = async (providerId) => {
    if (!selectedDate) { setDayAvailability(null); return }
    try {
      const params = new URLSearchParams({ date: selectedDate })
      const res = await fetch(`${API_BASE}/patient/provider/availability/${providerId}/by-date?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      })
      const data = await res.json()
      if (data.success) setDayAvailability(data.data)
    } catch (_) { /* ignore */ }
  }

  const handleSelectProvider = async (providerId) => {
    const provider = providers.find(p => p.id === providerId) || null
    setSelectedProvider(provider)
    setSlots([])
    setDayAvailability(null)
    if (selectedDate) {
      await fetchDayAvailability(providerId)
      await fetchGeneratedSlots(providerId)
    } else {
      await fetchSlots(providerId)
    }
  }

  return (
    <div className="patient-appointment">
      <div className="pa-header">
        <div className="pa-title">
          <h1>Book Appointment</h1>
          <p>Find providers, pick a time, and confirm your visit</p>
        </div>
        <button className="pa-back" onClick={() => navigate('/patient/dashboard')}>Back</button>
      </div>

      {error && <div className="pa-alert pa-alert-error">{error}</div>}

      <div className="pa-filters">
        <div className="pa-search">
          <input
            type="text"
            placeholder="Search provider, specialization, clinic or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pa-dates">
          <label>
            From
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <label>
            Date
            <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); if (selectedProvider) fetchDayAvailability(selectedProvider.id) }} />
          </label>
          <button
            className="pa-apply"
            onClick={() => selectedProvider ? (selectedDate ? fetchGeneratedSlots(selectedProvider.id) : fetchSlots(selectedProvider.id)) : null}
            title={selectedProvider ? 'Apply date filter' : 'Select a provider first'}
          >
            Apply
          </button>
        </div>
      </div>

      <div className="pa-content">
        <div className="pa-providers">
          <div className="pa-section-title">Providers</div>
          {loading && providers.length === 0 ? <div className="pa-skeleton" /> : null}
          <div className="pa-card-list">
            {filteredProviders.map(p => (
              <div key={p.id} className={`pa-card ${selectedProvider?.id === p.id ? 'active' : ''}`}>
                <div className="pa-card-main">
                  <div className="pa-avatar">{p.name.charAt(0)}</div>
                  <div className="pa-meta">
                    <div className="pa-name">{p.name}</div>
                    <div className="pa-sub">{p.specialization} • {p.clinic_name}</div>
                    <div className="pa-sub muted">{p.location}</div>
                  </div>
                </div>
                <div className="pa-card-actions">
                  <button className="pa-btn" onClick={() => handleSelectProvider(p.id)}>View Slots</button>
                </div>
              </div>
            ))}
            {filteredProviders.length === 0 && (
              <div className="pa-empty">No providers match your search.</div>
            )}
          </div>
        </div>

        <div className="pa-slots">
          <div className="pa-section-title">{selectedProvider ? `Available Slots — ${selectedProvider.name}` : 'Available Slots'}</div>
          {dayAvailability && (
            <div className="pa-day-availability">
              {dayAvailability.is_available ? (
                <span>On {dayAvailability.date} ({dayAvailability.day_of_week}), provider is available from {(dayAvailability.start_time||'').substring(0,5)} to {(dayAvailability.end_time||'').substring(0,5)} ({dayAvailability.timezone}).</span>
              ) : (
                <span>No availability on {dayAvailability.date} ({dayAvailability.day_of_week}).</span>
              )}
            </div>
          )}
          {(!selectedProvider) && (
            <div className="pa-empty">Select a provider to view availability and slots.</div>
          )}
          {selectedProvider && slots.length === 0 && !loading ? (
            <div className="pa-empty">No available slots for the selected dates.</div>
          ) : null}

          <div className="pa-slot-list">
            {slots.map(s => (
              <div key={`${s.id||''}-${s.date}-${s.start_time}`} className="pa-slot-card">
                <div className="pa-slot-time">
                  <div className="pa-slot-date">{s.date}</div>
                  <div className="pa-slot-range">{(s.start_time||'').substring(0,5)} - {(s.end_time||'').substring(0,5)} ({s.timezone})</div>
                </div>
                <div className="pa-slot-meta">
                  <div className="pill">{s.appointment_type.replace('_',' ')}</div>
                  <div className="pill">{s.slot_duration} min</div>
                  {s.location_type && <div className="pill alt">{s.location_type === 'virtual' ? 'Virtual' : 'In person'}</div>}
                </div>
                {s.fee ? <div className="pa-slot-fee">{s.fee} {s.currency}</div> : <div className="pa-slot-fee muted">Fee not specified</div>}
                <div className="pa-slot-actions">
                  {s.generated ? (
                    <button className="pa-btn primary" onClick={() => bookGenerated(s)}>Book</button>
                  ) : (
                    <button className="pa-btn primary" onClick={() => bookSlot(s.id)}>Book</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {loading && selectedProvider ? <div className="pa-skeleton wide" /> : null}
        </div>
      </div>
    </div>
  )
}

export default PatientAppointment 