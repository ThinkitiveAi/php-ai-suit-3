import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutProvider, getProviderProfile } from '../services/apiService'
import './ProviderDashboard.css'

const ProviderDashboard = () => {
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('auth_token')
        const providerData = localStorage.getItem('provider')
        
        if (!token || !providerData) {
          navigate('/login')
          return
        }

        // Parse provider data
        const parsedProvider = JSON.parse(providerData)
        setProvider(parsedProvider)
        
        // Optionally fetch fresh profile data
        // const profile = await getProviderProfile()
        // setProvider(profile.data.provider)
        
      } catch (err) {
        console.error('Dashboard initialization error:', err)
        setError('Failed to load dashboard. Please try logging in again.')
        // Clear invalid auth data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('provider')
        localStorage.removeItem('isAuthenticated')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [navigate])

  const handleLogout = async () => {
    try {
      setLoading(true)
      await logoutProvider()
      
      // Clear all auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('provider')
      localStorage.removeItem('isAuthenticated')
      
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails on server, clear local data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('provider')
      localStorage.removeItem('isAuthenticated')
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="provider-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="provider-info">
            <div className="provider-avatar">
              {provider?.profile_photo ? (
                <img src={provider.profile_photo} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {provider?.full_name?.charAt(0) || 'P'}
                </div>
              )}
            </div>
            <div className="provider-details">
              <h1>Welcome, {provider?.full_name}</h1>
              <p className="provider-role">{provider?.specialization}</p>
              <p className="provider-clinic">{provider?.clinic_name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Profile Information</h3>
            <div className="profile-info">
              <p><strong>Email:</strong> {provider?.email}</p>
              <p><strong>Phone:</strong> {provider?.phone}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge status-${provider?.status}`}>
                  {provider?.status}
                </span>
              </p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => navigate('/provider/patients')}>
                👥 Manage Patients
              </button>
              <button className="action-btn" onClick={() => navigate('/provider/patients/create')}>
                ➕ Add New Patient
              </button>
              <button className="action-btn" onClick={() => navigate('/provider/availability')}>
                📅 Manage Availability
              </button>
              <button className="dashboard-btn" onClick={() => navigate('/provider/appointments')}>
                📅 View Appointments
              </button>
              <button className="action-btn">
                ⚙️ Settings
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <p className="no-activity">No recent activity</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>System Status</h3>
            <div className="system-info">
              <p>✅ All systems operational</p>
              <p>🔒 Secure connection established</p>
              <p>📊 Dashboard loaded successfully</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProviderDashboard 