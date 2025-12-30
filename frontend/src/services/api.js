import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerTenant = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getCurrentUser = () => api.get('/api/auth/me');
export const logout = () => api.post('/api/auth/logout');

// Tenant APIs
export const getTenantDetails = (tenantId) => api.get(`/api/tenants/${tenantId}`);
export const updateTenant = (tenantId, data) => api.put(`/api/tenants/${tenantId}`, data);
export const listAllTenants = (params) => api.get('/api/tenants', { params });

// User APIs
export const addUser = (tenantId, data) => api.post(`/api/users/tenants/${tenantId}/users`, data);
export const listUsers = (tenantId, params) => api.get(`/api/users/tenants/${tenantId}/users`, { params });
export const updateUser = (userId, data) => api.put(`/api/users/${userId}`, data);
export const deleteUser = (userId) => api.delete(`/api/users/${userId}`);

// Project APIs
export const createProject = (data) => api.post('/api/projects', data);
export const listProjects = (params) => api.get('/api/projects', { params });
export const updateProject = (projectId, data) => api.put(`/api/projects/${projectId}`, data);
export const deleteProject = (projectId) => api.delete(`/api/projects/${projectId}`);

// Task APIs
export const createTask = (projectId, data) => api.post(`/api/tasks/projects/${projectId}/tasks`, data);
export const listTasks = (projectId, params) => api.get(`/api/tasks/projects/${projectId}/tasks`, { params });
export const updateTaskStatus = (taskId, data) => api.patch(`/api/tasks/${taskId}/status`, data);
export const updateTask = (taskId, data) => api.put(`/api/tasks/${taskId}`, data);
export const deleteTask = (taskId) => api.delete(`/api/tasks/${taskId}`);

export default api;
