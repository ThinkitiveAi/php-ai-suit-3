import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = ({ isRegistration = false }) => {
  return (
    <footer className="login-footer">
      <div className="footer-content">
        <div className="footer-links">
          {!isRegistration ? (
            <>
              <div className="footer-section">
                <span className="footer-text">New provider?</span>
                <Link to="/register" className="footer-link primary">
                  Create an account
                </Link>
              </div>
              
              <div className="footer-divider">•</div>
            </>
          ) : (
            <>
              <div className="footer-section">
                <span className="footer-text">Need help?</span>
                <a href="#support" className="footer-link primary">
                  Contact Support
                </a>
              </div>
              
              <div className="footer-divider">•</div>
            </>
          )}
          
          <div className="footer-section">
            <a href="#support" className="footer-link">
              Support
            </a>
            <a href="#privacy" className="footer-link">
              Privacy Policy
            </a>
            <a href="#terms" className="footer-link">
              Terms of Service
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            © 2024 HealthCarePro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 