import axios, { AxiosInstance, AxiosError } from 'axios'
import { frontendLogger } from './logging-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests + logging
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Log request
  frontendLogger.debug('API', `${config.method?.toUpperCase()} ${config.url}`, {
    method: config.method,
    path: config.url,
    hasAuth: !!token,
  })

  return config
})

// Log responses
apiClient.interceptors.response.use(
  (response) => {
    frontendLogger.debug('API', `${response.config.method?.toUpperCase()} ${response.config.url} - SUCCESS`, {
      method: response.config.method,
      path: response.config.url,
      status: response.status,
    })
    return response
  },
  (error: AxiosError) => {
    const message = `${error.config?.method?.toUpperCase()} ${error.config?.url} - FAILED`

    frontendLogger.error('API', message, error as Error, {
      method: error.config?.method,
      path: error.config?.url,
      status: error.response?.status,
      errorMessage: error.message,
      response: error.response?.data,
    })

    return Promise.reject(error)
  }
)

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
