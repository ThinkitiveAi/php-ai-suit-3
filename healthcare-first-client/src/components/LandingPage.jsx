import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="background-pattern"></div>
      </div>

      <div className="landing-container">
        <div className="landing-header">
          <h1>🏥 HealthCare Portal</h1>
          <p>Comprehensive Healthcare Management System</p>
        </div>

        <div className="login-options">
          <div className="option-card provider-card">
            <div className="card-icon">👨‍⚕️</div>
            <h2>Healthcare Providers</h2>
            <p>Manage your practice, patients, and medical records</p>
            <div className="features">
              <span>✓ Patient Management</span>
              <span>✓ Medical Records</span>
              <span>✓ Appointment Scheduling</span>
              <span>✓ Practice Analytics</span>
            </div>
            <button 
              onClick={() => navigate('/login')} 
              className="login-btn provider-btn"
            >
              Provider Login
            </button>
            <p className="register-link">
              New provider? <a href="/register">Register here</a>
            </p>
          </div>

          <div className="option-card patient-card">
            <div className="card-icon">👤</div>
            <h2>Patients</h2>
            <p>Access your medical records and communicate with your provider</p>
            <div className="features">
              <span>✓ View Medical Records</span>
              <span>✓ Appointment History</span>
              <span>✓ Prescription Details</span>
              <span>✓ Provider Communication</span>
            </div>
            <button 
              onClick={() => navigate('/patient/login')} 
              className="login-btn patient-btn"
            >
              Patient Login
            </button>
            <p className="info-text">
              Ask your healthcare provider for login credentials
            </p>
          </div>
        </div>

        <div className="landing-footer">
          <div className="footer-info">
            <h3>🔒 Secure & HIPAA Compliant</h3>
            <p>Your health information is protected with enterprise-grade security</p>
          </div>
          <div className="footer-info">
            <h3>📱 24/7 Access</h3>
            <p>Access your healthcare information anytime, anywhere</p>
          </div>
          <div className="footer-info">
            <h3>👨‍⚕️ Provider Network</h3>
            <p>Connect with healthcare providers across the network</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage 