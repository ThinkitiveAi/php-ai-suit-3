import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginProvider } from '../services/apiService'
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
    setSuccess(false)

    try {
      console.log('Attempting login with:', credentials)
      
      // Use the real API service
      const response = await loginProvider({
        credential: credentials.credential,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      })
      
      console.log('Login response:', response)

      if (response.success) {
        setSuccess(true)
        
        // Store provider data in localStorage for session management
        if (response.data && response.data.provider) {
          localStorage.setItem('provider', JSON.stringify(response.data.provider))
          localStorage.setItem('isAuthenticated', 'true')
        }
        
        // Show success message briefly then redirect
        setTimeout(() => {
          // In a real app, this would redirect to the provider dashboard
          alert(`Welcome ${response.data.provider.full_name}! In a real app, this would redirect to your dashboard.`)
          console.log('Provider logged in:', response.data.provider)
          
          // For demo purposes, you could redirect to a dashboard route
          // navigate('/dashboard')
        }, 1000)
        
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle different types of errors from the API
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