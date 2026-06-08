import { create } from 'zustand'
import { DEFAULT_CURRENCY } from '../content/currencies'

interface User {
  id: string
  email: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  currency: string
  setToken: (token: string) => void
  setUser: (user: User) => void
  setCurrency: (currency: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  currency: localStorage.getItem('userCurrency') || DEFAULT_CURRENCY.code,
  setToken: (token) => {
    localStorage.setItem('authToken', token)
    set({ token, isAuthenticated: true })
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  setCurrency: (currency) => {
    localStorage.setItem('userCurrency', currency)
    set({ currency })
  },
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userCurrency')
    set({ token: null, user: null, isAuthenticated: false, currency: DEFAULT_CURRENCY.code })
  },
}))
