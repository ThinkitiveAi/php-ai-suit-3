import React, { useState, useEffect } from 'react'
import { registerProvider, getSpecializations, getPracticeTypes } from '../services/apiService'
import RegistrationForm from './RegistrationForm'
import Header from './Header'
import Footer from './Footer'
import './ProviderRegistration.css'

const ProviderRegistration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [specializations, setSpecializations] = useState([])
  const [practiceTypes, setPracticeTypes] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const totalSteps = 4

  // Load reference data from API on component mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setDataLoading(true)
        
        // Load specializations and practice types from API
        const [specializationsData, practiceTypesData] = await Promise.all([
          getSpecializations(),
          getPracticeTypes()
        ])
        
        setSpecializations(specializationsData)
        setPracticeTypes(practiceTypesData)
        
        console.log('Loaded specializations:', specializationsData)
        console.log('Loaded practice types:', practiceTypesData)
      } catch (err) {
        console.error('Failed to load reference data:', err)
        
        // Fallback to hardcoded data if API fails
        setSpecializations([
          'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics',
          'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine',
          'Family Medicine', 'Internal Medicine', 'Obstetrics & Gynecology',
          'Oncology', 'Ophthalmology', 'Pathology', 'Surgery', 'Urology'
        ])
        setPracticeTypes([
          'Private Practice', 'Hospital', 'Clinic', 'Academic Medical Center',
          'Community Health Center', 'Urgent Care', 'Specialty Center'
        ])
      } finally {
        setDataLoading(false)
      }
    }

    loadReferenceData()
  }, [])

  const handleRegistration = async (formData) => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Attempting registration with:', formData)
      
      // Use the real API service
      const response = await registerProvider(formData)
      
      console.log('Registration response:', response)

      if (response.success) {
        setSuccess(true)
        console.log('Provider registered:', response.data)
      }
    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle validation errors from backend
      if (err.message.includes('email already exists')) {
        setError('An account with this email already exists. Please use a different email.')
      } else if (err.message.includes('phone already exists')) {
        setError('An account with this phone number already exists. Please use a different phone.')
      } else if (err.message.includes('license already registered')) {
        setError('This medical license number is already registered. Please verify your license.')
      } else {
        setError(err.message || 'Registration failed. Please try again.')
      }
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
            specializations={specializations}
            practiceTypes={practiceTypes}
            dataLoading={dataLoading}
          />
        </main>
        
        <Footer isRegistration={true} />
      </div>
    </div>
  )
}

export default ProviderRegistration 