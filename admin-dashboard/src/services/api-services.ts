/**
 * API Service Layer
 * Abstracts backend API calls for cleaner code reuse
 */

import apiClient from './api'

// ===== ORDERS SERVICE =====
export const ordersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/orders')
    return response.data?.data || []
  },

  create: async (order: any) => {
    const response = await apiClient.post('/orders', order)
    return response.data?.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data?.data
  }
}

// ===== ACCOUNTS SERVICE =====
export const accountsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/accounts')
    return response.data?.data || []
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/accounts/${id}`)
    return response.data?.data
  },

  create: async (account: any) => {
    const response = await apiClient.post('/accounts', account)
    return response.data?.data
  }
}

// ===== ZERODHA SERVICE =====
export const zerodhaAPI = {
  connect: async (accountId: string) => {
    const response = await apiClient.post(`/zerodha/connect/${accountId}`)
    return response.data?.data
  },

  getHoldings: async (accountId: string) => {
    const response = await apiClient.get(`/zerodha/${accountId}/holdings`)
    return response.data?.data || []
  },

  getOrders: async (accountId: string) => {
    const response = await apiClient.get(`/zerodha/${accountId}/orders`)
    return response.data?.data || []
  },

  getBalance: async (accountId: string) => {
    const response = await apiClient.get(`/zerodha/${accountId}/balance`)
    return response.data?.data
  }
}

// ===== AUDIT SERVICE =====
export const auditAPI = {
  getAll: async (limit?: number) => {
    const url = limit ? `/audit?limit=${limit}` : '/audit'
    const response = await apiClient.get(url)
    return response.data?.data || []
  },

  getByUser: async (userId: string) => {
    const response = await apiClient.get(`/audit/user/${userId}`)
    return response.data?.data || []
  }
}

// ===== MONITORING/ANALYTICS SERVICE =====
export const analyticsAPI = {
  getAnalytics: async (userId?: string) => {
    const url = userId ? `/monitoring/user-analytics/${userId}` : '/monitoring/analytics'
    const response = await apiClient.get(url)
    return response.data?.data
  },

  getMetrics: async () => {
    const response = await apiClient.get('/metrics/performance')
    return response.data?.data
  }
}

// ===== MARKET DATA SERVICE =====
export const marketAPI = {
  getQuote: async (symbol: string) => {
    const response = await apiClient.get(`/market/quote/${symbol}`)
    return response.data?.data
  },

  getQuotes: async (symbols: string[]) => {
    const response = await apiClient.post('/market/quotes', { symbols })
    return response.data?.data || []
  }
}

// ===== LOGS SERVICE =====
export const logsAPI = {
  getAll: async (limit?: number, level?: string) => {
    const url = `/logs?limit=${limit || 100}${level ? `&level=${level}` : ''}`
    const response = await apiClient.get(url)
    return response.data?.data || []
  },

  getByCorrelationId: async (correlationId: string) => {
    const response = await apiClient.get(`/logs/trace/${correlationId}`)
    return response.data?.data || []
  }
}

// ===== TEAM/USERS SERVICE =====
export const teamAPI = {
  getMembers: async () => {
    const response = await apiClient.get('/team/members')
    return response.data?.data || []
  },

  search: async (term: string, role?: string) => {
    const url = `/team/search?q=${term}${role ? `&role=${role}` : ''}`
    const response = await apiClient.get(url)
    return response.data?.data || []
  },

  getMetrics: async () => {
    const response = await apiClient.get('/team/metrics')
    return response.data?.data
  }
}

// ===== TESTING/DIAGNOSTICS SERVICE =====
export const diagnosticsAPI = {
  runTests: async () => {
    const response = await apiClient.post('/testing/run-all')
    return response.data?.data
  },

  getHealth: async () => {
    const response = await apiClient.get('/testing/health')
    return response.data?.data
  }
}
