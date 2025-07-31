import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './PatientDashboard.css'

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if patient is authenticated
        const token = localStorage.getItem('patient_auth_token')
        const patientData = localStorage.getItem('patient')
        
        if (!token || !patientData) {
          navigate('/patient/login')
          return
        }

        // Parse patient data
        const parsedPatient = JSON.parse(patientData)
        setPatient(parsedPatient)
        
        // Optionally fetch fresh profile data
        // await fetchPatientProfile()
        
      } catch (err) {
        console.error('Dashboard initialization error:', err)
        setError('Failed to load dashboard. Please try logging in again.')
        // Clear invalid auth data
        localStorage.removeItem('patient_auth_token')
        localStorage.removeItem('patient')
        localStorage.removeItem('isPatientAuthenticated')
        navigate('/patient/login')
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [navigate])

  const fetchPatientProfile = async () => {
    try {
      const token = localStorage.getItem('patient_auth_token')
      
      const response = await fetch('http://localhost:8001/api/patient/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()
      
      if (data.success) {
        setPatient(data.data.patient)
        localStorage.setItem('patient', JSON.stringify(data.data.patient))
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('patient_auth_token')
      
      await fetch('http://localhost:8001/api/patient/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      })
      
      // Clear all auth data
      localStorage.removeItem('patient_auth_token')
      localStorage.removeItem('patient')
      localStorage.removeItem('isPatientAuthenticated')
      
      navigate('/patient/login')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails on server, clear local data
      localStorage.removeItem('patient_auth_token')
      localStorage.removeItem('patient')
      localStorage.removeItem('isPatientAuthenticated')
      navigate('/patient/login')
    }
  }

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="patient-dashboard">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/patient/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="patient-info">
            <div className="patient-avatar">
              <div className="avatar-circle">
                {patient?.full_name?.charAt(0) || 'P'}
              </div>
            </div>
            <div className="patient-details">
              <h1>Welcome, {patient?.full_name}</h1>
              <p className="patient-id">Patient ID: {patient?.patient_id}</p>
              <p className="patient-provider">
                Healthcare Provider: {patient?.assigned_provider?.name}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Personal Information Card */}
          <div className="dashboard-card personal-info-card">
            <h3>👤 Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <value>{patient?.full_name}</value>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <value>{new Date(patient?.date_of_birth).toLocaleDateString()}</value>
              </div>
              <div className="info-item">
                <label>Age</label>
                <value>{patient?.age} years old</value>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <value className="capitalize">{patient?.gender}</value>
              </div>
              <div className="info-item">
                <label>Email</label>
                <value>{patient?.email}</value>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <value>{patient?.phone}</value>
              </div>
            </div>
          </div>

          {/* Medical Information Card */}
          <div className="dashboard-card medical-info-card">
            <h3>🏥 Medical Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Blood Type</label>
                <value>{patient?.blood_type || 'Not specified'}</value>
              </div>
              <div className="info-item">
                <label>Allergies</label>
                <value>{patient?.allergies || 'None known'}</value>
              </div>
              <div className="info-item full-width">
                <label>Medical History</label>
                <value>{patient?.medical_history || 'No medical history recorded'}</value>
              </div>
              <div className="info-item full-width">
                <label>Current Medications</label>
                <value>{patient?.current_medications || 'No current medications'}</value>
              </div>
            </div>
          </div>

          {/* Healthcare Provider Card */}
          <div className="dashboard-card provider-info-card">
            <h3>👨‍⚕️ Your Healthcare Provider</h3>
            <div className="provider-details">
              <div className="provider-avatar">
                {patient?.assigned_provider?.name?.charAt(0) || 'D'}
              </div>
              <div className="provider-info">
                <h4>{patient?.assigned_provider?.name}</h4>
                <p className="specialization">{patient?.assigned_provider?.specialization}</p>
                <p className="clinic">{patient?.assigned_provider?.clinic_name}</p>
                <div className="contact-info">
                  <p>📧 {patient?.assigned_provider?.email}</p>
                  <p>📞 {patient?.assigned_provider?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="dashboard-card emergency-contact-card">
            <h3>🚨 Emergency Contact</h3>
            <div className="contact-details">
              <div className="contact-item">
                <label>Name</label>
                <value>{patient?.emergency_contact_name}</value>
              </div>
              <div className="contact-item">
                <label>Phone</label>
                <value>{patient?.emergency_contact_phone}</value>
              </div>
              <div className="contact-item">
                <label>Relationship</label>
                <value>{patient?.emergency_contact_relation}</value>
              </div>
            </div>
          </div>

          {/* Insurance Information Card */}
          <div className="dashboard-card insurance-info-card">
            <h3>🛡️ Insurance Information</h3>
            <div className="insurance-details">
              <div className="insurance-item">
                <label>Insurance Provider</label>
                <value>{patient?.insurance_provider || 'Not specified'}</value>
              </div>
              <div className="insurance-item">
                <label>Policy Number</label>
                <value>{patient?.insurance_policy_number || 'Not specified'}</value>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="dashboard-card actions-card">
            <h3>⚡ Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn appointments-btn">
                📅 View Appointments
              </button>
              <button className="action-btn records-btn">
                📋 Medical Records
              </button>
              <button className="action-btn prescriptions-btn">
                💊 Prescriptions
              </button>
              <button className="action-btn contact-btn">
                💬 Contact Provider
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PatientDashboard 