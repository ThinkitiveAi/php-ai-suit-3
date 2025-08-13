import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProviderLogin from './components/ProviderLogin'
import ProviderRegistration from './components/ProviderRegistration'
import ProviderDashboard from './components/ProviderDashboard'
import ProviderAvailability from './components/ProviderAvailability'
import PatientLogin from './components/PatientLogin'
import PatientDashboard from './components/PatientDashboard'
import PatientManagement from './components/PatientManagement'
import CreatePatient from './components/CreatePatient'
import LandingPage from './components/LandingPage'
import './App.css'
import PatientAppointment from './components/PatientAppointment'

// Protected Route component for providers
const ProtectedProviderRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const token = localStorage.getItem('auth_token')
  
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Protected Route component for patients
const ProtectedPatientRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isPatientAuthenticated') === 'true'
  const token = localStorage.getItem('patient_auth_token')
  
  if (!isAuthenticated || !token) {
    return <Navigate to="/patient/login" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Provider Routes */}
          <Route path="/login" element={<ProviderLogin />} />
          <Route path="/register" element={<ProviderRegistration />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedProviderRoute>
                <ProviderDashboard />
              </ProtectedProviderRoute>
            } 
          />
          <Route 
            path="/provider/patients" 
            element={
              <ProtectedProviderRoute>
                <PatientManagement />
              </ProtectedProviderRoute>
            } 
          />
          <Route 
            path="/provider/patients/create" 
            element={
              <ProtectedProviderRoute>
                <CreatePatient />
              </ProtectedProviderRoute>
            } 
          />

          {/* Provider Availability Routes */}
          <Route 
            path="/provider/availability" 
            element={
              <ProtectedProviderRoute>
                <ProviderAvailability />
              </ProtectedProviderRoute>
            } 
          />
          <Route 
            path="/provider/availability/:providerId" 
            element={
              <ProtectedPatientRoute>
                <ProviderAvailability />
              </ProtectedPatientRoute>
            } 
          />

          {/* Patient Routes */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient" element={<Navigate to="/patient/login" replace />} />
          <Route 
            path="/patient/dashboard" 
            element={
              <ProtectedPatientRoute>
                <PatientDashboard />
              </ProtectedPatientRoute>
            } 
          />
          <Route 
            path="/patient/appointments" 
            element={
              <ProtectedPatientRoute>
                <PatientAppointment />
              </ProtectedPatientRoute>
            } 
          />

          {/* Default Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
