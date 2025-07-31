import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { checkEmailExists, checkPhoneExists, checkLicenseExists } from '../services/apiService'
import { 
  UserIcon, 
  EmailIcon, 
  PhoneIcon, 
  LockIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  LoadingIcon,
  UploadIcon,
  CheckIcon,
  MedicalBagIcon,
  HospitalIcon
} from './Icons'
import './RegistrationForm.css'

// Fallback data in case API fails
const fallbackSpecializations = [
  'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics',
  'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine',
  'Family Medicine', 'Internal Medicine', 'Obstetrics & Gynecology',
  'Oncology', 'Ophthalmology', 'Pathology', 'Surgery', 'Urology'
]

const fallbackPracticeTypes = [
  'Private Practice', 'Hospital', 'Clinic', 'Academic Medical Center',
  'Community Health Center', 'Urgent Care', 'Specialty Center'
]

const RegistrationForm = ({ 
  onRegister, 
  onStepChange, 
  isLoading, 
  error, 
  success, 
  currentStep, 
  totalSteps,
  specializations = fallbackSpecializations,
  practiceTypes = fallbackPracticeTypes,
  dataLoading = false
}) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: null,
    
    // Professional Information
    licenseNumber: '',
    specialization: '',
    yearsExperience: '',
    medicalDegree: '',
    
    // Practice Information
    clinicName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    practiceType: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const [validationErrors, setValidationErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validatingFields, setValidatingFields] = useState({})

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePhone = (phone) => {
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
    return phonePattern.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const validateLicenseNumber = (license) => {
    // Basic validation - should be alphanumeric and have minimum length
    return license.length >= 6 && /^[A-Za-z0-9]+$/.test(license)
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  // Enhanced validation with API checks
  const validateFieldWithAPI = async (field, value) => {
    if (!value) return ''
    
    setValidatingFields(prev => ({ ...prev, [field]: true }))
    
    try {
      switch (field) {
        case 'email':
          if (validateEmail(value)) {
            const result = await checkEmailExists(value)
            if (result.exists) {
              return 'An account with this email already exists'
            }
          }
          break
          
        case 'phone':
          if (validatePhone(value)) {
            const result = await checkPhoneExists(value)
            if (result.exists) {
              return 'An account with this phone number already exists'
            }
          }
          break
          
        case 'licenseNumber':
          if (validateLicenseNumber(value)) {
            const result = await checkLicenseExists(value)
            if (result.exists) {
              return 'This medical license number is already registered'
            }
          }
          break
      }
    } catch (err) {
      console.error('API validation error:', err)
      // Don't show error for API failures, just log them
    } finally {
      setValidatingFields(prev => ({ ...prev, [field]: false }))
    }
    
    return ''
  }

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone']
      case 2:
        return ['licenseNumber', 'specialization', 'yearsExperience', 'medicalDegree']
      case 3:
        return ['clinicName', 'street', 'city', 'state', 'zipCode', 'practiceType']
      case 4:
        return ['password', 'confirmPassword', 'agreeToTerms']
      default:
        return []
    }
  }

  const validateStep = (step) => {
    const fields = getStepFields(step)
    const errors = {}

    fields.forEach(field => {
      const value = formData[field]
      
      switch (field) {
        case 'firstName':
        case 'lastName':
          if (!value.trim()) errors[field] = `${field === 'firstName' ? 'First' : 'Last'} name is required`
          break
        case 'email':
          if (!value) errors[field] = 'Email is required'
          else if (!validateEmail(value)) errors[field] = 'Please enter a valid email address'
          break
        case 'phone':
          if (!value) errors[field] = 'Phone number is required'
          else if (!validatePhone(value)) errors[field] = 'Please enter a valid phone number'
          break
        case 'licenseNumber':
          if (!value) errors[field] = 'Medical license number is required'
          else if (!validateLicenseNumber(value)) errors[field] = 'Please enter a valid license number (min 6 characters, alphanumeric)'
          break
        case 'specialization':
          if (!value) errors[field] = 'Specialization is required'
          break
        case 'yearsExperience':
          if (!value) errors[field] = 'Years of experience is required'
          else if (isNaN(value) || value < 0 || value > 50) errors[field] = 'Please enter a valid number of years (0-50)'
          break
        case 'medicalDegree':
          if (!value.trim()) errors[field] = 'Medical degree/qualification is required'
          break
        case 'clinicName':
          if (!value.trim()) errors[field] = 'Clinic/Hospital name is required'
          break
        case 'street':
          if (!value.trim()) errors[field] = 'Street address is required'
          break
        case 'city':
          if (!value.trim()) errors[field] = 'City is required'
          break
        case 'state':
          if (!value.trim()) errors[field] = 'State is required'
          break
        case 'zipCode':
          if (!value.trim()) errors[field] = 'ZIP code is required'
          else if (!/^\d{5}(-\d{4})?$/.test(value)) errors[field] = 'Please enter a valid ZIP code'
          break
        case 'practiceType':
          if (!value) errors[field] = 'Practice type is required'
          break
        case 'password':
          if (!value) errors[field] = 'Password is required'
          else if (value.length < 8) errors[field] = 'Password must be at least 8 characters'
          else if (calculatePasswordStrength(value) < 3) errors[field] = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters'
          break
        case 'confirmPassword':
          if (!value) errors[field] = 'Please confirm your password'
          else if (value !== formData.password) errors[field] = 'Passwords do not match'
          break
        case 'agreeToTerms':
          if (!value) errors[field] = 'You must agree to the terms and conditions'
          break
      }
    })

    return errors
  }

  const handleInputChange = async (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Update password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Real-time API validation for specific fields (with debouncing)
    if (['email', 'phone', 'licenseNumber'].includes(field) && value) {
      clearTimeout(window[`${field}ValidationTimeout`])
      window[`${field}ValidationTimeout`] = setTimeout(async () => {
        const apiError = await validateFieldWithAPI(field, value)
        if (apiError) {
          setValidationErrors(prev => ({ ...prev, [field]: apiError }))
        }
      }, 1000) // 1 second debounce
    }
  }

  const handlePhotoUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, profilePhoto: file }))
      
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleNext = () => {
    const errors = validateStep(currentStep)
    setValidationErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      if (currentStep < totalSteps) {
        const nextStep = currentStep + 1
        onStepChange(nextStep)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      onStepChange(prevStep)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateStep(currentStep)
    setValidationErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      onRegister(formData)
    }
  }

  const renderStep1 = () => (
    <div className="form-step">
      <div className="step-header">
        <UserIcon />
        <h3>Personal Information</h3>
        <p>Tell us about yourself</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            className={`form-input ${validationErrors.firstName ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validationErrors.firstName && (
            <span className="field-error">{validationErrors.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            className={`form-input ${validationErrors.lastName ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validationErrors.lastName && (
            <span className="field-error">{validationErrors.lastName}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <div className="input-wrapper">
          <div className="input-icon">
            <EmailIcon />
          </div>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            className={`form-input ${validationErrors.email ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validatingFields.email && (
            <div className="validation-spinner">Checking...</div>
          )}
        </div>
        {validationErrors.email && (
          <span className="field-error">{validationErrors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <div className="input-wrapper">
          <div className="input-icon">
            <PhoneIcon />
          </div>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
            className={`form-input ${validationErrors.phone ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validatingFields.phone && (
            <div className="validation-spinner">Checking...</div>
          )}
        </div>
        {validationErrors.phone && (
          <span className="field-error">{validationErrors.phone}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Profile Photo (Optional)</label>
        <div className="photo-upload">
          {photoPreview ? (
            <div className="photo-preview">
              <img src={photoPreview} alt="Profile preview" />
              <button 
                type="button" 
                className="remove-photo"
                onClick={() => {
                  setPhotoPreview(null)
                  setFormData(prev => ({ ...prev, profilePhoto: null }))
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div 
              className="upload-area"
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                handlePhotoUpload(file)
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <UploadIcon />
              <p>Drag & drop your photo here or click to browse</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files[0])}
                className="file-input"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="form-step">
      <div className="step-header">
        <MedicalBagIcon />
        <h3>Professional Information</h3>
        <p>Your medical credentials</p>
      </div>

      <div className="form-group">
        <label htmlFor="licenseNumber" className="form-label">Medical License Number</label>
        <div className="input-wrapper">
          <input
            id="licenseNumber"
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter your medical license number"
            className={`form-input ${validationErrors.licenseNumber ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validatingFields.licenseNumber && (
            <div className="validation-spinner">Checking...</div>
          )}
        </div>
        {validationErrors.licenseNumber && (
          <span className="field-error">{validationErrors.licenseNumber}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="specialization" className="form-label">Specialization</label>
        <select
          id="specialization"
          value={formData.specialization}
          onChange={(e) => handleInputChange('specialization', e.target.value)}
          className={`form-select ${validationErrors.specialization ? 'error' : ''}`}
          disabled={isLoading || dataLoading}
        >
          <option value="">
            {dataLoading ? 'Loading specializations...' : 'Select your specialization'}
          </option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {validationErrors.specialization && (
          <span className="field-error">{validationErrors.specialization}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="yearsExperience" className="form-label">Years of Experience</label>
        <input
          id="yearsExperience"
          type="number"
          min="0"
          max="50"
          value={formData.yearsExperience}
          onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
          placeholder="Enter years of experience"
          className={`form-input ${validationErrors.yearsExperience ? 'error' : ''}`}
          disabled={isLoading}
        />
        {validationErrors.yearsExperience && (
          <span className="field-error">{validationErrors.yearsExperience}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="medicalDegree" className="form-label">Medical Degree/Qualifications</label>
        <input
          id="medicalDegree"
          type="text"
          value={formData.medicalDegree}
          onChange={(e) => handleInputChange('medicalDegree', e.target.value)}
          placeholder="e.g., MD, DO, MBBS"
          className={`form-input ${validationErrors.medicalDegree ? 'error' : ''}`}
          disabled={isLoading}
        />
        {validationErrors.medicalDegree && (
          <span className="field-error">{validationErrors.medicalDegree}</span>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="form-step">
      <div className="step-header">
        <HospitalIcon />
        <h3>Practice Information</h3>
        <p>Where you practice medicine</p>
      </div>

      <div className="form-group">
        <label htmlFor="clinicName" className="form-label">Clinic/Hospital Name</label>
        <input
          id="clinicName"
          type="text"
          value={formData.clinicName}
          onChange={(e) => handleInputChange('clinicName', e.target.value)}
          placeholder="Enter clinic or hospital name"
          className={`form-input ${validationErrors.clinicName ? 'error' : ''}`}
          disabled={isLoading}
        />
        {validationErrors.clinicName && (
          <span className="field-error">{validationErrors.clinicName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="street" className="form-label">Street Address</label>
        <input
          id="street"
          type="text"
          value={formData.street}
          onChange={(e) => handleInputChange('street', e.target.value)}
          placeholder="Enter street address"
          className={`form-input ${validationErrors.street ? 'error' : ''}`}
          disabled={isLoading}
        />
        {validationErrors.street && (
          <span className="field-error">{validationErrors.street}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city" className="form-label">City</label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
            className={`form-input ${validationErrors.city ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validationErrors.city && (
            <span className="field-error">{validationErrors.city}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="state" className="form-label">State</label>
          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state"
            className={`form-input ${validationErrors.state ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validationErrors.state && (
            <span className="field-error">{validationErrors.state}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="zipCode" className="form-label">ZIP Code</label>
          <input
            id="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="Enter ZIP code"
            className={`form-input ${validationErrors.zipCode ? 'error' : ''}`}
            disabled={isLoading}
          />
          {validationErrors.zipCode && (
            <span className="field-error">{validationErrors.zipCode}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="practiceType" className="form-label">Practice Type</label>
        <select
          id="practiceType"
          value={formData.practiceType}
          onChange={(e) => handleInputChange('practiceType', e.target.value)}
          className={`form-select ${validationErrors.practiceType ? 'error' : ''}`}
          disabled={isLoading || dataLoading}
        >
          <option value="">
            {dataLoading ? 'Loading practice types...' : 'Select practice type'}
          </option>
          {practiceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {validationErrors.practiceType && (
          <span className="field-error">{validationErrors.practiceType}</span>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="form-step">
      <div className="step-header">
        <LockIcon />
        <h3>Account Security</h3>
        <p>Secure your account</p>
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <div className="input-wrapper">
          <div className="input-icon">
            <LockIcon />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password"
            className={`form-input ${validationErrors.password ? 'error' : ''}`}
            disabled={isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
        {validationErrors.password && (
          <span className="field-error">{validationErrors.password}</span>
        )}
        
        {formData.password && (
          <div className="password-strength">
            <div className="strength-indicator">
              <div 
                className={`strength-bar strength-${passwordStrength}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              ></div>
            </div>
            <span className="strength-text">
              {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Fair' : passwordStrength <= 4 ? 'Good' : 'Strong'}
            </span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
        <div className="input-wrapper">
          <div className="input-icon">
            <LockIcon />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
            disabled={isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <span className="field-error">{validationErrors.confirmPassword}</span>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            disabled={isLoading}
            className="checkbox-input"
          />
          <span className="checkbox-custom"></span>
          <span className="checkbox-label">
            I agree to the <a href="#terms" className="terms-link">Terms and Conditions</a> and <a href="#privacy" className="terms-link">Privacy Policy</a>
          </span>
        </label>
        {validationErrors.agreeToTerms && (
          <span className="field-error">{validationErrors.agreeToTerms}</span>
        )}
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  if (success) {
    return (
      <div className="registration-form-container">
        <div className="registration-card">
          <div className="success-state">
            <CheckIcon />
            <h3>Registration Successful!</h3>
            <p>Welcome to our healthcare network. Your account has been created successfully.</p>
            <div className="next-steps">
              <h4>Next Steps:</h4>
              <ul>
                <li>Check your email for verification instructions</li>
                <li>Your account will be reviewed and approved within 24-48 hours</li>
                <li>You'll receive a notification once approved</li>
              </ul>
            </div>
            <div className="success-actions">
              <Link to="/login" className="btn btn-primary">Go to Login</Link>
              <a href="#dashboard" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="registration-form-container">
      <div className="registration-card">
        {error && (
          <div className="error-message animate-fade-in" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {renderCurrentStep()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrevious}
                disabled={isLoading}
              >
                Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || dataLoading}
              >
                {dataLoading ? 'Loading...' : 'Next'}
              </button>
            ) : (
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingIcon />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistrationForm 