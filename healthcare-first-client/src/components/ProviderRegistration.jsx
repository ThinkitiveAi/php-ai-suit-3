import React, { useState } from 'react'
import RegistrationForm from './RegistrationForm'
import Header from './Header'
import Footer from './Footer'
import './ProviderRegistration.css'

const ProviderRegistration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleRegistration = async (formData) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate validation
      if (formData.email === 'existing@healthcare.com') {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.')
      }
      
      if (formData.licenseNumber === '12345') {
        throw new Error('This medical license number is already registered. Please verify your license number.')
      }
      
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepChange = (step) => {
    setCurrentStep(step)
  }

  return (
    <div className="provider-registration">
      <div className="registration-background">
        <div className="background-pattern"></div>
      </div>
      
      <div className="registration-container">
        <Header isRegistration={true} />
        
        <main className="registration-main">
          <div className="registration-header">
            <h2>Provider Registration</h2>
            <p>Join our healthcare network and start connecting with patients</p>
            
            <div className="progress-indicator">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">Step {currentStep} of {totalSteps}</span>
            </div>
          </div>
          
          <RegistrationForm 
            onRegister={handleRegistration}
            onStepChange={handleStepChange}
            isLoading={isLoading}
            error={error}
            success={success}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </main>
        
        <Footer isRegistration={true} />
      </div>
    </div>
  )
}

export default ProviderRegistration 