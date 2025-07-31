// API Service for Healthcare Provider System
const API_BASE_URL = 'http://localhost:8001/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Helper function to make API requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // Important for session-based auth
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API Service Object
export const apiService = {
  // Authentication endpoints
  auth: {
    // Login provider
    login: async (credentials) => {
      return makeRequest('/provider/login', {
        method: 'POST',
        body: JSON.stringify({
          credential: credentials.credential || credentials.email,
          password: credentials.password,
          remember_me: credentials.rememberMe || false,
        }),
      });
    },

    // Register provider
    register: async (formData) => {
      // Convert frontend form data to backend format
      const apiData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        license_number: formData.licenseNumber,
        specialization: formData.specialization,
        years_experience: parseInt(formData.yearsExperience),
        medical_degree: formData.medicalDegree,
        clinic_name: formData.clinicName,
        street_address: formData.street,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        practice_type: formData.practiceType,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        agree_to_terms: formData.agreeToTerms,
      };

      // Handle file upload if profile photo exists
      if (formData.profilePhoto instanceof File) {
        const uploadData = new FormData();
        Object.entries(apiData).forEach(([key, value]) => {
          uploadData.append(key, value);
        });
        uploadData.append('profile_photo', formData.profilePhoto);

        return makeRequest('/provider/register', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: uploadData,
        });
      } else {
        return makeRequest('/provider/register', {
          method: 'POST',
          body: JSON.stringify(apiData),
        });
      }
    },

    // Logout provider
    logout: async () => {
      return makeRequest('/provider/logout', {
        method: 'POST',
      });
    },

    // Get provider profile
    getProfile: async () => {
      return makeRequest('/provider/profile');
    },
  },

  // Validation endpoints
  validation: {
    // Check if email exists
    checkEmail: async (email) => {
      return makeRequest('/provider/check-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    // Check if phone exists
    checkPhone: async (phone) => {
      return makeRequest('/provider/check-phone', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },

    // Check if license exists
    checkLicense: async (licenseNumber) => {
      return makeRequest('/provider/check-license', {
        method: 'POST',
        body: JSON.stringify({ license_number: licenseNumber }),
      });
    },
  },

  // Reference data endpoints
  reference: {
    // Get available specializations
    getSpecializations: async () => {
      const response = await makeRequest('/provider/specializations');
      return response.specializations || [];
    },

    // Get available practice types
    getPracticeTypes: async () => {
      const response = await makeRequest('/provider/practice-types');
      return response.practice_types || [];
    },
  },
};

// Convenience functions for easy use in components
export const loginProvider = (credentials) => apiService.auth.login(credentials);
export const registerProvider = (formData) => apiService.auth.register(formData);
export const logoutProvider = () => apiService.auth.logout();
export const getProviderProfile = () => apiService.auth.getProfile();

export const checkEmailExists = (email) => apiService.validation.checkEmail(email);
export const checkPhoneExists = (phone) => apiService.validation.checkPhone(phone);
export const checkLicenseExists = (licenseNumber) => apiService.validation.checkLicense(licenseNumber);

export const getSpecializations = () => apiService.reference.getSpecializations();
export const getPracticeTypes = () => apiService.reference.getPracticeTypes();

export default apiService; 