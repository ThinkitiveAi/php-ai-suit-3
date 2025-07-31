# Frontend API Integration Guide

This directory contains the API service layer for connecting the React frontend with the Laravel backend.

## Files Structure

```
src/
├── services/
│   ├── apiService.js          # Main API service with all endpoints
│   └── README.md              # This file
├── config/
│   ├── apiRoutes.js           # API routes configuration
│   └── api.js                 # Alternative API client (if you prefer)
└── components/
    ├── LoginForm.integration.js      # Login integration example
    └── RegistrationForm.integration.js # Registration integration example
```

## Quick Start

### 1. Import the API service

```javascript
import { apiService, loginProvider, registerProvider } from '../services/apiService'
```

### 2. Use in your components

#### Login Example
```javascript
import { loginProvider } from '../services/apiService'

const handleLogin = async (credentials) => {
  try {
    const response = await loginProvider(credentials)
    if (response.success) {
      // Handle successful login
      console.log('User data:', response.data.provider)
    }
  } catch (error) {
    // Handle error
    setError(error.message)
  }
}
```

#### Registration Example
```javascript
import { registerProvider } from '../services/apiService'

const handleRegistration = async (formData) => {
  try {
    const response = await registerProvider(formData)
    if (response.success) {
      // Handle successful registration
      setSuccess(true)
    }
  } catch (error) {
    // Handle error
    setError(error.message)
  }
}
```

#### Validation Example
```javascript
import { checkEmailExists, checkPhoneExists } from '../services/apiService'

const validateEmail = async (email) => {
  try {
    const result = await checkEmailExists(email)
    if (result.exists) {
      setEmailError('Email already exists')
    }
  } catch (error) {
    console.error('Validation error:', error)
  }
}
```

## Available API Functions

### Authentication
- `loginProvider(credentials)` - Login with email/phone and password
- `registerProvider(formData)` - Register new provider
- `logoutProvider()` - Logout current provider
- `getProviderProfile()` - Get current provider profile

### Validation
- `checkEmailExists(email)` - Check if email is already registered
- `checkPhoneExists(phone)` - Check if phone is already registered  
- `checkLicenseExists(licenseNumber)` - Check if license is already registered

### Reference Data
- `getSpecializations()` - Get list of medical specializations
- `getPracticeTypes()` - Get list of practice types

## Data Format Conversion

The API service automatically converts between frontend and backend data formats:

### Frontend Form Data → Backend API Data
```javascript
// Frontend
{
  firstName: 'John',
  lastName: 'Doe',
  licenseNumber: 'MD123456',
  yearsExperience: '10'
}

// Converted to Backend
{
  first_name: 'John',
  last_name: 'Doe', 
  license_number: 'MD123456',
  years_experience: 10
}
```

## Error Handling

The API service throws descriptive errors that you can catch and display:

```javascript
try {
  await loginProvider(credentials)
} catch (error) {
  if (error.message.includes('Invalid credentials')) {
    setError('Wrong email or password')
  } else if (error.message.includes('pending approval')) {
    setError('Account is pending approval')
  } else {
    setError('Login failed. Please try again.')
  }
}
```

## Integration with Existing Components

### Update ProviderLogin.jsx

Replace the simulated login logic:

```javascript
// OLD - Simulated
const handleLogin = async (credentials) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  if (credentials.credential === 'demo@healthcare.com') {
    setSuccess(true)
  }
}

// NEW - Real API
import { loginProvider } from '../services/apiService'

const handleLogin = async (credentials) => {
  try {
    const response = await loginProvider(credentials)
    if (response.success) {
      setSuccess(true)
      localStorage.setItem('provider', JSON.stringify(response.data.provider))
    }
  } catch (error) {
    setError(error.message)
  }
}
```

### Update ProviderRegistration.jsx

Replace the simulated registration logic:

```javascript
// OLD - Simulated  
const handleRegistration = async (formData) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  if (formData.email === 'existing@healthcare.com') {
    throw new Error('Email already exists')
  }
  setSuccess(true)
}

// NEW - Real API
import { registerProvider } from '../services/apiService'

const handleRegistration = async (formData) => {
  try {
    const response = await registerProvider(formData)
    if (response.success) {
      setSuccess(true)
    }
  } catch (error) {
    setError(error.message)
  }
}
```

## Configuration

### Change Backend URL

Update the base URL in `src/config/apiRoutes.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-domain.com/api', // Change this
  TIMEOUT: 10000,
  // ...
}
```

### Add New Endpoints

1. Add route to `src/config/apiRoutes.js`:
```javascript
export const API_ROUTES = {
  AUTH: {
    // ... existing routes
    RESET_PASSWORD: '/provider/reset-password',
  }
}
```

2. Add function to `src/services/apiService.js`:
```javascript
export const apiService = {
  auth: {
    // ... existing functions
    resetPassword: async (email) => {
      return makeRequest('/provider/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  }
}
```

## Testing API Endpoints

You can test individual endpoints:

```javascript
// Test login
import { loginProvider } from '../services/apiService'
loginProvider({ credential: 'demo@healthcare.com', password: 'demo123' })
  .then(response => console.log('Login success:', response))
  .catch(error => console.error('Login error:', error))

// Test validation
import { checkEmailExists } from '../services/apiService'
checkEmailExists('test@example.com')
  .then(result => console.log('Email exists:', result.exists))
  .catch(error => console.error('Check error:', error))
```

## Backend Requirements

Make sure your Laravel backend is running with:
- ✅ CORS middleware configured
- ✅ API routes defined
- ✅ Provider authentication endpoints
- ✅ Validation endpoints  
- ✅ Reference data endpoints

Start backend: `php artisan serve --host=127.0.0.1 --port=8001` 