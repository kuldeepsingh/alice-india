import axios, { AxiosInstance } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),
}

export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
}

export const accountsAPI = {
  getAll: () => apiClient.get('/accounts'),
  getById: (id: string) => apiClient.get(`/accounts/${id}`),
  create: (data: any) => apiClient.post('/accounts', data),
  update: (id: string, data: any) => apiClient.put(`/accounts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/accounts/${id}`),
}

export const ordersAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  create: (data: any) => apiClient.post('/orders', data),
  update: (id: string, data: any) => apiClient.put(`/orders/${id}`, data),
  cancel: (id: string) => apiClient.post(`/orders/${id}/cancel`),
}

export default apiClient
