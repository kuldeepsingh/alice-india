/**
 * API Client Service
 * 
 * This module provides the HTTP client for communicating with the backend.
 * It handles:
 * - Base URL configuration
 * - Authentication (JWT token in headers)
 * - Request/response logging
 * - Error handling
 * - API endpoint definitions
 * 
 * All API calls are automatically logged at DEBUG/ERROR level:
 * - DEBUG: Request sent, response received
 * - ERROR: Request failed, network error, invalid response
 * 
 * The client uses Axios, which provides:
 * - Promise-based API
 * - Request/response interceptors
 * - Automatic JSON serialization
 * - Timeout handling
 * - Error normalization
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import { frontendLogger } from './logging-client'

/**
 * API base URL from environment or localhost
 * 
 * Example:
 * - Production: https://api.boottrade.com/api/v1
 * - Development: http://localhost:3000/api/v1
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Create Axios instance with configuration
 * 
 * Configuration:
 * - baseURL: Prepended to all requests
 * - Content-Type: application/json (default)
 * - Timeout: 30s (default)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * 
 * Runs before every request is sent to the server.
 * 
 * Purpose:
 * 1. Add JWT auth token from localStorage to Authorization header
 * 2. Log the request details (method, path, auth status)
 * 
 * This ensures all protected endpoints receive the JWT token without
 * having to manually add it in every API call.
 * 
 * Token format: Bearer <JWT_TOKEN>
 * (RFC 6750 standard)
 */
apiClient.interceptors.request.use((config) => {
  // Retrieve JWT token from localStorage
  const token = localStorage.getItem('authToken')

  // Add Authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // DEBUG: Log that request is being sent
  // Include method, path, and auth status
  frontendLogger.debug('API', `${config.method?.toUpperCase()} ${config.url}`, {
    method: config.method,
    path: config.url,
    hasAuth: !!token,
  })

  // Return modified config (with auth header)
  return config
})

/**
 * Response Interceptor
 * 
 * Runs after receiving response from server (success or error).
 * 
 * Purpose:
 * 1. Log successful responses (method, path, status code)
 * 2. Log failed responses (method, path, status, error details)
 * 3. Normalize error handling for consistent error response format
 * 
 * Success path:
 *   - Response received with status 2xx
 *   - Log at DEBUG level
 *   - Return response to calling code
 * 
 * Error path:
 *   - Response received with status 3xx, 4xx, 5xx
 *   - OR network error (no response received)
 *   - Log at ERROR level with full details
 *   - Reject promise to calling code
 */
apiClient.interceptors.response.use(
  /**
   * Success handler: Response received with status 2xx
   * 
   * @param response - Successful HTTP response
   * @returns response - Passed through unchanged
   */
  (response) => {
    // DEBUG: Log successful response
    frontendLogger.debug('API', `${response.config.method?.toUpperCase()} ${response.config.url} - SUCCESS`, {
      method: response.config.method,
      path: response.config.url,
      status: response.status,
    })
    // Pass response to calling code
    return response
  },

  /**
   * Error handler: Response received with error status or network error
   * 
   * @param error - Axios error with request/response details
   * @returns Promise.reject() - Rejects promise to calling code
   */
  (error: AxiosError) => {
    // Construct error message from method and URL
    const message = `${error.config?.method?.toUpperCase()} ${error.config?.url} - FAILED`

    // ERROR: Log the failed request with full context
    frontendLogger.error('API', message, error as Error, {
      method: error.config?.method,
      path: error.config?.url,
      status: error.response?.status,                    // HTTP status code (404, 500, etc.)
      errorMessage: error.message,                       // Error message
      response: error.response?.data,                    // Server response body
    })

    // Reject promise so calling code can catch the error
    return Promise.reject(error)
  }
)

/**
 * API Endpoints
 * 
 * These objects group related API calls by domain.
 * Each endpoint is a function that returns a Promise.
 * 
 * Usage:
 *   const response = await authAPI.login('user@example.com', 'password')
 *   const { token, user } = response.data
 */

/**
 * Authentication API endpoints
 * 
 * Methods:
 * - login: Authenticate user with email/password
 * - register: Create new user account
 */
export const authAPI = {
  /**
   * POST /auth/login
   * Authenticate user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password (plain text)
   * @returns Promise with { token, refreshToken, user }
   */
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  /**
   * POST /auth/register
   * Create new user account
   * 
   * @param email - User's email address
   * @param password - User's password (will be hashed on backend)
   * @returns Promise with { id, email, role }
   */
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),
}

/**
 * User Management API endpoints
 */
export const usersAPI = {
  /**
   * GET /team/members
   * Retrieve all users (admin only)
   *
   * @returns Promise with array of users
   */
  getAll: () => apiClient.get('/team/members'),

  /**
   * GET /users/:id
   * Retrieve specific user by ID
   *
   * @param id - User ID
   * @returns Promise with user object
   */
  getById: (id: string) => apiClient.get(`/users/${id}`),

  /**
   * POST /users
   * Create new user (admin only)
   *
   * @param data - User data { name, email, role }
   * @returns Promise with created user
   */
  create: (data: any) => apiClient.post('/users', data),

  /**
   * DELETE /team/members/:id
   * Delete user by ID (admin only)
   *
   * @param id - User ID
   * @returns Promise with deletion confirmation
   */
  delete: (id: string) => apiClient.delete(`/team/members/${id}`),
}

/**
 * Account Management API endpoints
 */
export const accountsAPI = {
  /**
   * GET /accounts
   * Retrieve all trading accounts
   * 
   * @returns Promise with array of accounts
   */
  getAll: () => apiClient.get('/accounts'),

  /**
   * GET /accounts/:id
   * Retrieve specific account by ID
   * 
   * @param id - Account ID
   * @returns Promise with account object
   */
  getById: (id: string) => apiClient.get(`/accounts/${id}`),

  /**
   * POST /accounts
   * Create new trading account
   * 
   * @param data - Account data
   * @returns Promise with created account
   */
  create: (data: any) => apiClient.post('/accounts', data),

  /**
   * PUT /accounts/:id
   * Update existing account
   * 
   * @param id - Account ID
   * @param data - Updated data
   * @returns Promise with updated account
   */
  update: (id: string, data: any) => apiClient.put(`/accounts/${id}`, data),

  /**
   * DELETE /accounts/:id
   * Delete account
   * 
   * @param id - Account ID
   * @returns Promise with deletion confirmation
   */
  delete: (id: string) => apiClient.delete(`/accounts/${id}`),
}

/**
 * Order Management API endpoints
 */
export const ordersAPI = {
  /**
   * GET /orders
   * Retrieve all orders
   * 
   * @returns Promise with array of orders
   */
  getAll: () => apiClient.get('/orders'),

  /**
   * GET /orders/:id
   * Retrieve specific order by ID
   * 
   * @param id - Order ID
   * @returns Promise with order object
   */
  getById: (id: string) => apiClient.get(`/orders/${id}`),

  /**
   * POST /orders
   * Create new order (buy or sell)
   * 
   * @param data - Order data { symbol, quantity, price, type }
   * @returns Promise with created order
   */
  create: (data: any) => apiClient.post('/orders', data),

  /**
   * PUT /orders/:id
   * Update existing order (if not executed)
   * 
   * @param id - Order ID
   * @param data - Updated order data
   * @returns Promise with updated order
   */
  update: (id: string, data: any) => apiClient.put(`/orders/${id}`, data),

  /**
   * POST /orders/:id/cancel
   * Cancel order (if not executed)
   * 
   * @param id - Order ID
   * @returns Promise with cancellation confirmation
   */
  cancel: (id: string) => apiClient.post(`/orders/${id}/cancel`),
}

// Default export: the Axios client instance for advanced usage
export default apiClient
