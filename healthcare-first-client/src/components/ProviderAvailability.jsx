import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ProviderAvailability.css'

const ProviderAvailability = () => {
  const [availabilities, setAvailabilities] = useState([])
  const [blockedDays, setBlockedDays] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [timezone, setTimezone] = useState('UTC')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isProvider, setIsProvider] = useState(null)
  const navigate = useNavigate()
  const { providerId } = useParams()

  const daysOfWeek = [
    { key: 'monday', name: 'Monday' },
    { key: 'tuesday', name: 'Tuesday' },
    { key: 'wednesday', name: 'Wednesday' },
    { key: 'thursday', name: 'Thursday' },
    { key: 'friday', name: 'Friday' },
    { key: 'saturday', name: 'Saturday' },
    { key: 'sunday', name: 'Sunday' },
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ]

  useEffect(() => {
    // Check if user is provider or patient
    const authToken = localStorage.getItem('auth_token')
    const patientToken = localStorage.getItem('patient_auth_token')
    
    if (authToken) {
      setIsProvider(true)
    } else if (patientToken) {
      setIsProvider(false)
    } else {
      navigate('/')
      return
    }
  }, [navigate])

  useEffect(() => {
    if (isProvider !== null) {
      fetchAvailabilityData()
    }
  }, [isProvider])

  const fetchAvailabilityData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token') || localStorage.getItem('patient_auth_token')
      
      // Determine the API endpoint based on user type
      const endpoint = isProvider 
        ? 'http://localhost:8001/api/provider/availability'
        : `http://localhost:8001/api/patient/provider/availability/${providerId || '1'}`
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('Availability data loaded:', data.data)
        setAvailabilities(data.data.availabilities)
        setSelectedProvider(data.data.provider)
        setTimezone(data.data.availabilities[0]?.timezone || 'UTC')
      } else {
        setError(data.message || 'Failed to load availability data')
        // Fallback: create default availability structure
        const defaultAvailabilities = daysOfWeek.map(day => ({
          id: null,
          day_of_week: day.key,
          day_name: day.name,
          start_time: null,
          end_time: null,
          timezone: 'UTC',
          is_active: false,
          formatted_start_time: null,
          formatted_end_time: null,
        }))
        setAvailabilities(defaultAvailabilities)
      }
    } catch (err) {
      setError('Failed to load availability data')
      console.error('Error fetching availability:', err)
      // Fallback: create default availability structure
      const defaultAvailabilities = daysOfWeek.map(day => ({
        id: null,
        day_of_week: day.key,
        day_name: day.name,
        start_time: null,
        end_time: null,
        timezone: 'UTC',
        is_active: false,
        formatted_start_time: null,
        formatted_end_time: null,
      }))
      setAvailabilities(defaultAvailabilities)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvailabilityChange = (dayKey, field, value) => {
    setAvailabilities(prev => 
      prev.map(day => 
        day.day_of_week === dayKey 
          ? { ...day, [field]: value }
          : day
      )
    )
  }

  const handleSave = async () => {
    if (isProvider !== true) {
      setError('Only providers can modify availability settings')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('http://localhost:8001/api/provider/availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilities: availabilities.map(day => ({
            day_of_week: day.day_of_week,
            start_time: day.start_time,
            end_time: day.end_time,
            timezone: timezone,
            is_active: day.is_active
          }))
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Availability settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to save availability settings')
      }
    } catch (err) {
      setError('Failed to save availability settings')
      console.error('Error saving availability:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAvailability = async (id) => {
    if (isProvider !== true) {
      setError('Only providers can delete availability settings')
      return
    }

    if (!id) return

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`http://localhost:8001/api/provider/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Availability deleted successfully!')
        fetchAvailabilityData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to delete availability')
      }
    } catch (err) {
      setError('Failed to delete availability')
      console.error('Error deleting availability:', err)
    }
  }

  const handleAddBlockedDay = () => {
    if (isProvider !== true) {
      setError('Only providers can add blocked days')
      return
    }

    const newBlockedDay = {
      id: Date.now(),
      date: '',
      start_time: '',
      end_time: '',
      reason: '',
      is_full_day: true
    }
    setBlockedDays(prev => [...prev, newBlockedDay])
  }

  const handleBlockedDayChange = (index, field, value) => {
    if (isProvider !== true) return

    setBlockedDays(prev => 
      prev.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    )
  }

  const handleDeleteBlockedDay = (index) => {
    if (isProvider !== true) return

    setBlockedDays(prev => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="provider-availability">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading availability settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="provider-availability">
      <div className="availability-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => navigate(isProvider === true ? '/dashboard' : '/patient/dashboard')}>
            ☰
          </button>
          <h1>Provider Availability</h1>
          {selectedProvider && (
            <span className="provider-name">- {selectedProvider.name}</span>
          )}
        </div>
        <div className="header-right">
          <button className="search-btn">🔍</button>
          <button className="notification-btn">🔔</button>
          <button className="profile-btn">👤</button>
          <button className="code-btn">{'</>'}</button>
        </div>
      </div>

      <div className="availability-container">
        <div className="availability-content">
          {/* Day Wise Availability Section */}
          <div className="availability-section">
            <h2>Day Wise Availability</h2>
            <div className="availability-list">
              {availabilities.length > 0 ? availabilities.map((day) => (
                <div key={day.day_of_week} className="availability-item">
                  <div className="day-info">
                    <span className="day-name">{day.day_name}</span>
                  </div>
                  <div className="time-inputs">
                    <div className="time-input">
                      <label>From:</label>
                      <input
                        type="time"
                        value={day.start_time ? day.start_time.substring(0, 5) : ''}
                        onChange={(e) => handleAvailabilityChange(day.day_of_week, 'start_time', e.target.value)}
                        disabled={!day.is_active || isProvider !== true}
                      />
                    </div>
                    <div className="time-input">
                      <label>Till:</label>
                      <input
                        type="time"
                        value={day.end_time ? day.end_time.substring(0, 5) : ''}
                        onChange={(e) => handleAvailabilityChange(day.day_of_week, 'end_time', e.target.value)}
                        disabled={!day.is_active || isProvider !== true}
                      />
                    </div>
                  </div>
                  <div className="availability-actions">
                    {isProvider === true ? (
                      <>
                        <label className="active-toggle">
                          <input
                            type="checkbox"
                            checked={day.is_active}
                            onChange={(e) => handleAvailabilityChange(day.day_of_week, 'is_active', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        {day.id && (
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteAvailability(day.id)}
                            title="Delete availability"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    ) : (
                      <span className={`status-indicator ${day.is_active ? 'active' : 'inactive'}`}>
                        {day.is_active ? 'Available' : 'Not Available'}
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="no-availability">
                  <p>No availability data loaded. Please try refreshing the page.</p>
                </div>
              )}
            </div>
          </div>

          {/* Slot Creation Setting Section */}
          <div className="slot-settings-section">
            <h2>Slot Creation Setting</h2>
            
            <div className="timezone-setting">
              <label>Time Zone:</label>
              <select 
                value={timezone} 
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isProvider !== true}
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="blocked-days-section">
              <h3>Block Days</h3>
              <div className="blocked-days-list">
                {blockedDays.map((day, index) => (
                  <div key={day.id} className="blocked-day-item">
                    <div className="blocked-day-inputs">
                      <div className="input-group">
                        <label>Date:</label>
                        <input
                          type="date"
                          value={day.date}
                          onChange={(e) => handleBlockedDayChange(index, 'date', e.target.value)}
                          disabled={isProvider !== true}
                        />
                      </div>
                      <div className="input-group">
                        <label>From:</label>
                        <input
                          type="time"
                          value={day.start_time}
                          onChange={(e) => handleBlockedDayChange(index, 'start_time', e.target.value)}
                          disabled={day.is_full_day || isProvider !== true}
                        />
                      </div>
                      <div className="input-group">
                        <label>Till:</label>
                        <input
                          type="time"
                          value={day.end_time}
                          onChange={(e) => handleBlockedDayChange(index, 'end_time', e.target.value)}
                          disabled={day.is_full_day || isProvider !== true}
                        />
                      </div>
                    </div>
                    {isProvider === true && (
                      <div className="blocked-day-actions">
                        <label className="full-day-toggle">
                          <input
                            type="checkbox"
                            checked={day.is_full_day}
                            onChange={(e) => handleBlockedDayChange(index, 'is_full_day', e.target.checked)}
                          />
                          <span>Full Day</span>
                        </label>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteBlockedDay(index)}
                          title="Delete blocked day"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isProvider === true && (
                <button 
                  className="add-blocked-day-btn"
                  onClick={handleAddBlockedDay}
                >
                  + Add Block Days
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>{success}</span>
          </div>
        )}

        <div className="availability-actions">
          <button className="close-btn" onClick={() => navigate(isProvider === true ? '/dashboard' : '/patient/dashboard')}>
            Close
          </button>
          {isProvider === true && (
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderAvailability 