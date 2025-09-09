import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/admin';

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use(
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

// Add response interceptor to handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Forbidden - not admin
      alert('Access denied. Admin privileges required.');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Dashboard API calls
export const getDashboardStats = () => adminApi.get('/dashboard');

// User Management API calls
export const getAllUsers = () => adminApi.get('/users');
export const searchUsers = (params) => adminApi.get('/users/search', { params });
export const getUserById = (id) => adminApi.get(`/users/${id}`);
export const updateUser = (id, userData) => adminApi.put(`/users/${id}`, userData);
export const softDeleteUser = (id) => adminApi.delete(`/users/${id}`);
export const restoreUser = (id) => adminApi.post(`/users/${id}/restore`);

// Profile Management API calls
export const getAllProfiles = () => adminApi.get('/profiles');
export const getPendingProfiles = () => adminApi.get('/profiles/pending');
export const approveProfile = (id) => adminApi.post(`/profiles/${id}/approve`);
export const rejectProfile = (id, reason) => {
  return adminApi.post(`/profiles/${id}/reject`, { reason });
};
export const revokeProfile = (id) => adminApi.post(`/profiles/${id}/revoke`);

export default adminApi;
