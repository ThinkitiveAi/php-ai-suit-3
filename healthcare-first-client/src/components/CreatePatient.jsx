import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreatePatient.css'

const CreatePatient = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    
    // Address Information
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    
    // Medical Information
    blood_type: '',
    allergies: '',
    medical_history: '',
    current_medications: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    // Insurance Information
    insurance_provider: '',
    insurance_policy_number: '',
    
    // Notes
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('http://localhost:8001/api/provider/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(data)
        // Show success message for a few seconds then redirect
        setTimeout(() => {
          navigate('/provider/patients')
        }, 5000)
      } else {
        setError(data.message || 'Failed to create patient')
      }
    } catch (err) {
      console.error('Error creating patient:', err)
      setError('Failed to create patient. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="create-patient">
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Patient Created Successfully!</h2>
            <div className="patient-info">
              <h3>{success.data.patient.full_name}</h3>
              <p><strong>Patient ID:</strong> {success.data.patient.patient_id}</p>
              <p><strong>Email:</strong> {success.data.patient.email}</p>
            </div>
            <div className="credentials-info">
              <h4>🔐 Login Credentials</h4>
              <div className="credential-item">
                <strong>Temporary Password:</strong> 
                <span className="password">{success.data.temporary_password}</span>
              </div>
              <p className="login-note">{success.data.login_instructions}</p>
            </div>
            <div className="success-actions">
              <button onClick={() => navigate('/provider/patients')} className="btn-primary">
                View All Patients
              </button>
              <button onClick={() => window.location.reload()} className="btn-secondary">
                Create Another Patient
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-patient">
      <header className="page-header">
        <div className="header-content">
          <h1>Create New Patient</h1>
          <button onClick={() => navigate('/provider/patients')} className="back-btn">
            ← Back to Patients
          </button>
        </div>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="patient-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="form-section">
            <h2>👤 Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h2>🏠 Address Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="form-section">
            <h2>🏥 Medical Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Blood Type</label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="List any known allergies..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleInputChange}
                  placeholder="Previous medical conditions, surgeries, etc..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Current Medications</label>
                <textarea
                  name="current_medications"
                  value={formData.current_medications}
                  onChange={handleInputChange}
                  placeholder="List current medications and dosages..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-section">
            <h2>🚨 Emergency Contact</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Name *</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Relationship *</label>
                <input
                  type="text"
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  required
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="form-section">
            <h2>🛡️ Insurance Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Insurance Provider</label>
                <input
                  type="text"
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue Cross Blue Shield"
                />
              </div>
              <div className="form-group">
                <label>Policy Number</label>
                <input
                  type="text"
                  name="insurance_policy_number"
                  value={formData.insurance_policy_number}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <h2>📝 Provider Notes</h2>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about the patient..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Creating Patient...' : 'Create Patient'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/provider/patients')} 
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePatient 