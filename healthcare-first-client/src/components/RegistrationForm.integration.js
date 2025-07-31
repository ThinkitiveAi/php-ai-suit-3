// Example: How to integrate API service with existing RegistrationForm component
// Replace the existing registration logic in ProviderRegistration.jsx

import { 
  registerProvider, 
  checkEmailExists, 
  checkPhoneExists, 
  checkLicenseExists,
  getSpecializations,
  getPracticeTypes 
} from '../services/apiService'

// In your ProviderRegistration component, update the handleRegistration function:

const handleRegistration = async (formData) => {
  setIsLoading(true)
  setError('')

  try {
    // Use the API service instead of simulation
    const response = await registerProvider(formData)

    if (response.success) {
      setSuccess(true)
      console.log('Provider registered:', response.data)
    }
  } catch (err) {
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

// Enhanced validation with API checks:

const enhancedValidateField = async (field, value) => {
  // First do local validation
  let error = validateStep(currentStep)[field] || ''
  
  if (!error) {
    // Then do API validation for specific fields
    try {
      switch (field) {
        case 'email':
          if (value) {
            const emailCheck = await checkEmailExists(value)
            if (emailCheck.exists) {
              error = 'An account with this email already exists'
            }
          }
          break
          
        case 'phone':
          if (value) {
            const phoneCheck = await checkPhoneExists(value)
            if (phoneCheck.exists) {
              error = 'An account with this phone number already exists'
            }
          }
          break
          
        case 'licenseNumber':
          if (value) {
            const licenseCheck = await checkLicenseExists(value)
            if (licenseCheck.exists) {
              error = 'This medical license number is already registered'
            }
          }
          break
      }
    } catch (err) {
      console.error('API validation error:', err)
      // Don't set error for API failures, just log them
    }
  }
  
  return error
}

// Load reference data from API:

const loadReferenceData = async () => {
  try {
    const [specializations, practiceTypes] = await Promise.all([
      getSpecializations(),
      getPracticeTypes()
    ])
    
    // Update your component state with the loaded data
    setSpecializations(specializations)
    setPracticeTypes(practiceTypes)
  } catch (err) {
    console.error('Failed to load reference data:', err)
    // Fallback to hardcoded data if API fails
  }
}

// Usage in component:
/*
import React, { useState, useEffect } from 'react'
import { 
  registerProvider, 
  checkEmailExists, 
  checkPhoneExists, 
  checkLicenseExists,
  getSpecializations,
  getPracticeTypes 
} from '../services/apiService'
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
  const totalSteps = 4

  // Load reference data on component mount
  useEffect(() => {
    loadReferenceData()
  }, [])

  const handleRegistration = async (formData) => {
    // ... implementation above
  }

  const handleStepChange = (step) => {
    setCurrentStep(step)
  }

  return (
    <div className="provider-registration">
      // ... existing JSX
    </div>
  )
}
*/ 