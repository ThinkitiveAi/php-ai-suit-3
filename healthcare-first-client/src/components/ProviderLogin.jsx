import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginProvider } from '../services/apiService'
import './ProviderLogin.css'

const ProviderLogin = () => {
  const [formData, setFormData] = useState({
    credential: '',
    password: '',
    rememberMe: false
  })
  const [isLoading, setIsLoading] = useState(false)
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
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('Attempting login with:', formData)
      
      const response = await loginProvider({
        credential: formData.credential,
        password: formData.password,
        rememberMe: formData.rememberMe
      })
      
      console.log('Login response:', response)

      if (response.success) {
        setSuccess(true)
        
        if (response.data && response.data.provider) {
          localStorage.setItem('provider', JSON.stringify(response.data.provider))
          localStorage.setItem('isAuthenticated', 'true')
          
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token)
          }
        }
        
        setTimeout(() => {
          console.log('Provider logged in successfully, redirecting to dashboard...')
          navigate('/dashboard')
        }, 1000)
        
      }
    } catch (err) {
      console.error('Login error:', err)
      
      if (err.message.includes('Invalid credentials')) {
        setError('Invalid email/phone or password. Please try again.')
      } else if (err.message.includes('pending approval')) {
        setError('Your account is pending approval. Please wait for administrator review.')
      } else if (err.message.includes('rejected')) {
        setError('Your account has been rejected. Please contact support.')
      } else if (err.message.includes('suspended')) {
        setError('Your account has been suspended. Please contact support.')
      } else {
        setError('Login failed. Please check your connection and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="provider-login">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1>🏥 HealthCare Portal</h1>
          <p>Provider Access</p>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h2>Provider Login</h2>
            <p>Access your practice management dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>Login successful! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email or Phone</label>
              <input
                type="text"
                name="credential"
                value={formData.credential}
                onChange={handleInputChange}
                placeholder="Enter your email or phone number"
                required
                disabled={isLoading}
              />
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
                disabled={isLoading}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="login-btn">
              {isLoading ? (
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
              <a href="/forgot-password">Forgot your password?</a>
            </p>
            <div className="divider">
              <span>or</span>
            </div>
            <p>
              Don't have an account? 
              <a href="/register" className="register-link"> Register here</a>
            </p>
            <div className="divider">
              <span>or</span>
            </div>
            <p>
              Are you a patient? 
              <a href="/patient/login" className="patient-link"> Patient Login</a>
            </p>
          </div>
        </div>

        <div className="login-info">
          <div className="info-card">
            <h3>👨‍⚕️ Practice Management</h3>
            <p>Manage your patients, appointments, and medical records</p>
          </div>
          <div className="info-card">
            <h3>📊 Analytics Dashboard</h3>
            <p>Track your practice performance and patient outcomes</p>
          </div>
          <div className="info-card">
            <h3>🔒 Secure & HIPAA Compliant</h3>
            <p>Enterprise-grade security for your medical practice</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProviderLogin 