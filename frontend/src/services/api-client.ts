import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1'

const apiClient = axios.create({
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

// Trading API
export const tradingAPI = {
  getHealth: () => apiClient.get('/health/live'),
  createOrder: (data: any) => apiClient.post('/orders', data),
  getOrders: () => apiClient.get('/orders'),
  getAccounts: () => apiClient.get('/accounts'),
}

// Market API (with Claude)
export const marketAPI = {
  analyzeSentiment: (data: any) => apiClient.post('/market-analysis/sentiment', data),
  assessRisk: (data: any) => apiClient.post('/market-analysis/risk', data),
}

export default apiClient
