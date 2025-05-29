import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  searchUsers: (email) => api.get(`/auth/search?email=${encodeURIComponent(email)}`),
};

export const propertyService = {
  getProperties: (filters) => api.get('/properties', { params: filters }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

export const favoriteService = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (propertyId) => api.post('/favorites', { propertyId }),
  removeFavorite: (propertyId) => api.delete(`/favorites/${propertyId}`),
};

export const recommendationService = {
  recommendProperty: (data) => api.post('/recommendations', data),
  getReceivedRecommendations: () => api.get('/recommendations/received'),
  getSentRecommendations: () => api.get('/recommendations/sent'),
  markRecommendationAsRead: (id) => api.patch(`/recommendations/${id}/read`),
};

export default api;
