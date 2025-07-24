import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import Header from './Header'
import Footer from './Footer'
import './ProviderLogin.css'

const ProviderLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (credentials) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate validation
      if (credentials.credential === 'demo@healthcare.com' && credentials.password === 'demo123') {
        setSuccess(true)
        setTimeout(() => {
          // In a real app, this would redirect to the dashboard
          console.log('Redirecting to provider dashboard...')
          // For demo purposes, we'll just show a message since we don't have a dashboard
          alert('Login successful! In a real app, this would redirect to the provider dashboard.')
        }, 1000)
      } else {
        throw new Error('Invalid credentials. Please check your email/phone and password.')
      }
    } catch (err) {
      setError(err.message)
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
        <Header />
        
        <main className="login-main">
          <LoginForm 
            onLogin={handleLogin}
            isLoading={isLoading}
            error={error}
            success={success}
          />
        </main>
        
        <Footer />
      </div>
    </div>
  )
}

export default ProviderLogin 