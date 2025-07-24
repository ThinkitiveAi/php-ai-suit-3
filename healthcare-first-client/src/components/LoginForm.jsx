import React, { useState } from 'react'
import { EyeIcon, EyeSlashIcon, UserIcon, LockIcon, LoadingIcon } from './Icons'
import './LoginForm.css'

const LoginForm = ({ onLogin, isLoading, error, success }) => {
  const [formData, setFormData] = useState({
    credential: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [inputType, setInputType] = useState('email') // 'email' or 'phone'

  const validateCredential = (value) => {
    if (!value) return 'Email or phone number is required'
    
    // Check if it's a phone number (simple pattern)
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (phonePattern.test(value.replace(/[\s\-\(\)]/g, ''))) {
      setInputType('phone')
      return ''
    } else if (emailPattern.test(value)) {
      setInputType('email')
      return ''
    } else {
      return 'Please enter a valid email address or phone number'
    }
  }

  const validatePassword = (value) => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    let error = ''
    if (field === 'credential') {
      error = validateCredential(value)
    } else if (field === 'password') {
      error = validatePassword(value)
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all fields
    const credentialError = validateCredential(formData.credential)
    const passwordError = validatePassword(formData.password)
    
    const errors = {
      credential: credentialError,
      password: passwordError
    }
    
    setValidationErrors(errors)
    
    // Check if there are any errors
    if (!Object.values(errors).some(error => error)) {
      onLogin(formData)
    }
  }

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="card-header">
          <h2>Provider Login</h2>
          <p>Sign in to access your healthcare dashboard</p>
        </div>

        {error && (
          <div className="error-message animate-fade-in" role="alert">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message animate-fade-in" role="alert">
            <span>Login successful! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="credential" className="form-label">
              Email or Phone Number
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <UserIcon />
              </div>
              <input
                id="credential"
                type={inputType === 'email' ? 'email' : 'tel'}
                value={formData.credential}
                onChange={(e) => handleInputChange('credential', e.target.value)}
                placeholder="Enter your email or phone number"
                className={`form-input ${validationErrors.credential ? 'error' : ''}`}
                autoComplete={inputType === 'email' ? 'email' : 'tel'}
                disabled={isLoading}
                aria-invalid={!!validationErrors.credential}
                aria-describedby={validationErrors.credential ? 'credential-error' : undefined}
              />
            </div>
            {validationErrors.credential && (
              <span id="credential-error" className="field-error" role="alert">
                {validationErrors.credential}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <LockIcon />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={!!validationErrors.password}
                aria-describedby={validationErrors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {validationErrors.password && (
              <span id="password-error" className="field-error" role="alert">
                {validationErrors.password}
              </span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                disabled={isLoading}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Remember me</span>
            </label>

            <a href="#forgot-password" className="forgot-password-link">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''} ${success ? 'success' : ''}`}
            disabled={isLoading || success}
            aria-label={isLoading ? 'Signing in...' : 'Sign in'}
          >
            {isLoading ? (
              <>
                <LoadingIcon />
                <span>Signing in...</span>
              </>
            ) : success ? (
              <span>Success!</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <p className="demo-info">Email: demo@healthcare.com</p>
          <p className="demo-info">Password: demo123</p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 