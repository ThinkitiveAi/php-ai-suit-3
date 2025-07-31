import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PatientLogin.css'

const PatientLogin = () => {
  const [formData, setFormData] = useState({
    credential: '', // email or patient_id
    password: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('http://localhost:8001/api/patient/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: formData.credential,
          password: formData.password,
          remember_me: formData.rememberMe
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        
        // Store patient authentication data
        if (data.data && data.data.patient) {
          localStorage.setItem('patient', JSON.stringify(data.data.patient))
          localStorage.setItem('isPatientAuthenticated', 'true')
          
          // Store the Sanctum token
          if (data.data.token) {
            localStorage.setItem('patient_auth_token', data.data.token)
          }
        }
        
        // Redirect to patient dashboard
        setTimeout(() => {
          navigate('/patient/dashboard')
        }, 1000)
        
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Patient login error:', err)
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patient-login">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1>🏥 HealthCare Portal</h1>
          <p>Patient Access</p>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h2>Patient Login</h2>
            <p>Access your medical records and appointments</p>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>Login successful! Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email or Patient ID</label>
              <input
                type="text"
                name="credential"
                value={formData.credential}
                onChange={handleInputChange}
                placeholder="Enter your email or Patient ID (e.g., PAT123456)"
                required
                disabled={loading}
              />
              <small className="help-text">
                You can use either your email address or your Patient ID
              </small>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              <a href="/patient/forgot-password">Forgot your password?</a>
            </p>
            <div className="divider">
              <span>or</span>
            </div>
            <p>
              Are you a healthcare provider? 
              <a href="/login" className="provider-link"> Provider Login</a>
            </p>
          </div>
        </div>

        <div className="login-info">
          <div className="info-card">
            <h3>🔒 Secure Access</h3>
            <p>Your medical information is protected with enterprise-grade security</p>
          </div>
          <div className="info-card">
            <h3>📱 24/7 Access</h3>
            <p>View your health records, appointments, and test results anytime</p>
          </div>
          <div className="info-card">
            <h3>👨‍⚕️ Direct Communication</h3>
            <p>Connect with your healthcare provider easily and securely</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientLogin 