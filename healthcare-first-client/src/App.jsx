import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProviderLogin from './components/ProviderLogin'
import ProviderRegistration from './components/ProviderRegistration'
import './App.css'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<ProviderLogin />} />
          <Route path="/register" element={<ProviderRegistration />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
