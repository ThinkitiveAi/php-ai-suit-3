// API Configuration
const API_BASE_URL = 'http://localhost:8001/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  PROVIDER_REGISTER: '/provider/register',
  PROVIDER_LOGIN: '/provider/login',
  PROVIDER_LOGOUT: '/provider/logout',
  PROVIDER_PROFILE: '/provider/profile',
  
  // Validation
  CHECK_EMAIL: '/provider/check-email',
  CHECK_PHONE: '/provider/check-phone',
  CHECK_LICENSE: '/provider/check-license',
  
  // Reference data
  SPECIALIZATIONS: '/provider/specializations',
  PRACTICE_TYPES: '/provider/practice-types',
};

// Axios configuration
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
};

// Helper function to create full URL
export const createApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Helper function to handle API responses
export const handleApiResponse = async (response) => {
  if (response.ok) {
    const data = await response.json();
    return { success: true, data };
  } else {
    const errorData = await response.json().catch(() => ({}));
    return { 
      success: false, 
      error: errorData.message || 'An error occurred',
      errors: errorData.errors || {},
      status: response.status
    };
  }
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    success: false,
    error: error.message || 'Network error occurred',
    errors: {},
    status: 0
  };
};

// API client functions
export const apiClient = {
  // Generic request function
  async request(endpoint, options = {}) {
    try {
      const url = createApiUrl(endpoint);
      const config = {
        ...apiConfig.headers,
        ...options.headers,
      };

      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: config,
        credentials: 'include', // Important for session cookies
      });

      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET request
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  },

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },

  // File upload request
  async upload(endpoint, formData) {
    try {
      const url = createApiUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        body: formData, // Don't set Content-Type for FormData
        credentials: 'include',
      });

      return await handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Specific API functions for provider authentication
export const providerApi = {
  // Register a new provider
  async register(formData) {
    // Handle file upload if profile photo is included
    if (formData.profile_photo instanceof File) {
      const uploadData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        uploadData.append(key, value);
      });
      return apiClient.upload(API_ENDPOINTS.PROVIDER_REGISTER, uploadData);
    } else {
      return apiClient.post(API_ENDPOINTS.PROVIDER_REGISTER, formData);
    }
  },

  // Login provider
  async login(credentials) {
    return apiClient.post(API_ENDPOINTS.PROVIDER_LOGIN, credentials);
  },

  // Logout provider
  async logout() {
    return apiClient.post(API_ENDPOINTS.PROVIDER_LOGOUT);
  },

  // Get provider profile
  async getProfile() {
    return apiClient.get(API_ENDPOINTS.PROVIDER_PROFILE);
  },

  // Check if email exists
  async checkEmail(email) {
    return apiClient.post(API_ENDPOINTS.CHECK_EMAIL, { email });
  },

  // Check if phone exists
  async checkPhone(phone) {
    return apiClient.post(API_ENDPOINTS.CHECK_PHONE, { phone });
  },

  // Check if license exists
  async checkLicense(license_number) {
    return apiClient.post(API_ENDPOINTS.CHECK_LICENSE, { license_number });
  },

  // Get available specializations
  async getSpecializations() {
    return apiClient.get(API_ENDPOINTS.SPECIALIZATIONS);
  },

  // Get available practice types
  async getPracticeTypes() {
    return apiClient.get(API_ENDPOINTS.PRACTICE_TYPES);
  },
};

export default apiClient; 