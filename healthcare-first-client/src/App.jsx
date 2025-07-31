import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProviderLogin from './components/ProviderLogin'
import ProviderRegistration from './components/ProviderRegistration'
import ProviderDashboard from './components/ProviderDashboard'
import './App.css'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const token = localStorage.getItem('auth_token')
  
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<ProviderLogin />} />
          <Route path="/register" element={<ProviderRegistration />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
