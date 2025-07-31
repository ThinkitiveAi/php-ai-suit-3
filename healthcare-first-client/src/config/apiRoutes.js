// API Routes Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8001/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const API_ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/provider/login',
    REGISTER: '/provider/register',
    LOGOUT: '/provider/logout',
    PROFILE: '/provider/profile',
  },

  // Validation routes
  VALIDATION: {
    CHECK_EMAIL: '/provider/check-email',
    CHECK_PHONE: '/provider/check-phone',
    CHECK_LICENSE: '/provider/check-license',
  },

  // Reference data routes
  REFERENCE: {
    SPECIALIZATIONS: '/provider/specializations',
    PRACTICE_TYPES: '/provider/practice-types',
  },
};

// Route builder helper
export const buildRoute = (route) => `${API_CONFIG.BASE_URL}${route}`;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// API route definitions with metadata
export const API_ENDPOINTS = {
  // Authentication endpoints
  login: {
    path: API_ROUTES.AUTH.LOGIN,
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    description: 'Provider login with email/phone and password',
  },
  
  register: {
    path: API_ROUTES.AUTH.REGISTER,
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    description: 'Register new healthcare provider',
  },
  
  logout: {
    path: API_ROUTES.AUTH.LOGOUT,
    method: HTTP_METHODS.POST,
    requiresAuth: true,
    description: 'Logout authenticated provider',
  },
  
  getProfile: {
    path: API_ROUTES.AUTH.PROFILE,
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    description: 'Get authenticated provider profile',
  },

  // Validation endpoints
  checkEmail: {
    path: API_ROUTES.VALIDATION.CHECK_EMAIL,
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    description: 'Check if email already exists',
  },
  
  checkPhone: {
    path: API_ROUTES.VALIDATION.CHECK_PHONE,
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    description: 'Check if phone number already exists',
  },
  
  checkLicense: {
    path: API_ROUTES.VALIDATION.CHECK_LICENSE,
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    description: 'Check if license number already exists',
  },

  // Reference data endpoints
  getSpecializations: {
    path: API_ROUTES.REFERENCE.SPECIALIZATIONS,
    method: HTTP_METHODS.GET,
    requiresAuth: false,
    description: 'Get list of medical specializations',
  },
  
  getPracticeTypes: {
    path: API_ROUTES.REFERENCE.PRACTICE_TYPES,
    method: HTTP_METHODS.GET,
    requiresAuth: false,
    description: 'Get list of practice types',
  },
};

export default API_ROUTES; 