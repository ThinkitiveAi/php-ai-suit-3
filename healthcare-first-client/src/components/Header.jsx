import React from 'react'
import { Link } from 'react-router-dom'
import { MedicalIcon } from './Icons'
import './Header.css'

const Header = ({ isRegistration = false }) => {
  return (
    <header className="login-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <MedicalIcon />
          </div>
          <div className="logo-text">
            <h1>HealthCare<span className="brand-accent">Pro</span></h1>
            <p className="tagline">Provider Portal</p>
          </div>
        </div>
        
        {isRegistration && (
          <div className="header-navigation">
            <span className="nav-text">Already have an account?</span>
            <Link to="/login" className="nav-link">Sign In</Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 