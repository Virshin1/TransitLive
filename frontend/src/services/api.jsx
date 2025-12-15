/**
 * API Service
 * Handles HTTP requests to the backend API
 */

import axios from 'axios';

// API base URL - update to match backend port
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const apiService = {
  // Routes
  getAllRoutes: () => api.get('/routes'),
  getRoute: (id) => api.get(`/routes/${id}`),
  getRouteVehiclePosition: (id) => api.get(`/routes/${id}/vehicle-position`),
  getRoutesByType: (type) => api.get(`/routes/type/${type}`),

  // Stops
  getAllStops: () => api.get('/stops'),
  getStop: (id) => api.get(`/stops/${id}`),
  getStopPredictions: (id) => api.get(`/stops/${id}/predictions`),
  getNearbyStops: (lat, lng, distance) => 
    api.get(`/stops/nearby/${lat}/${lng}?distance=${distance}`),

  // Alerts
  getAllAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/alerts${query ? '?' + query : ''}`);
  },
  // Get only active alerts (convenience method)
  getActiveAlerts: () => api.get('/alerts?active=true'),
  getAlert: (id) => api.get(`/alerts/${id}`),
  createAlert: (data) => api.post('/alerts', data),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),

  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me')
};

export default apiService;
