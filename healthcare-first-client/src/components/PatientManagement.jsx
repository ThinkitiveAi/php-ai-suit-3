import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './PatientManagement.css'

const PatientManagement = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('http://localhost:8001/api/provider/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()
      
      if (data.success) {
        setPatients(data.data.patients)
      } else {
        setError('Failed to load patients')
      }
    } catch (err) {
      console.error('Error fetching patients:', err)
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePatient = () => {
    navigate('/provider/patients/create')
  }

  const handleViewPatient = (patientId) => {
    navigate(`/provider/patients/${patientId}`)
  }

  const handleEditPatient = (patientId) => {
    navigate(`/provider/patients/${patientId}/edit`)
  }

  if (loading) {
    return (
      <div className="patient-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="patient-management">
      <header className="page-header">
        <div className="header-content">
          <h1>Patient Management</h1>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="patients-container">
        <div className="patients-header">
          <div className="patients-title">
            <h2>Your Patients ({patients.length})</h2>
          </div>
          <button onClick={handleCreatePatient} className="create-patient-btn">
            ➕ Add New Patient
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {patients.length === 0 ? (
          <div className="no-patients">
            <div className="no-patients-content">
              <h3>No Patients Yet</h3>
              <p>You haven't added any patients yet. Start by creating your first patient.</p>
              <button onClick={handleCreatePatient} className="create-first-patient-btn">
                Add Your First Patient
              </button>
            </div>
          </div>
        ) : (
          <div className="patients-grid">
            {patients.map((patient) => (
              <div key={patient.id} className="patient-card">
                <div className="patient-info">
                  <div className="patient-avatar">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div className="patient-details">
                    <h3>{patient.full_name}</h3>
                    <p className="patient-id">ID: {patient.patient_id}</p>
                    <p className="patient-email">{patient.email}</p>
                    <p className="patient-meta">
                      {patient.age} years old • {patient.gender}
                    </p>
                    <span className={`status-badge status-${patient.status}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
                <div className="patient-actions">
                  <button 
                    onClick={() => handleViewPatient(patient.id)}
                    className="action-btn view-btn"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEditPatient(patient.id)}
                    className="action-btn edit-btn"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientManagement 