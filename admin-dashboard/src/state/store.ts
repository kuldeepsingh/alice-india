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
  darkMode: boolean
  setToken: (token: string) => void
  setUser: (user: User) => void
  setCurrency: (currency: string) => void
  setDarkMode: (darkMode: boolean) => void
  toggleDarkMode: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  currency: localStorage.getItem('userCurrency') || DEFAULT_CURRENCY.code,
  darkMode: localStorage.getItem('darkMode') === 'true',
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
  setDarkMode: (darkMode) => {
    localStorage.setItem('darkMode', String(darkMode))
    set({ darkMode })
    // Update document class for global dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  },
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.darkMode
      localStorage.setItem('darkMode', String(newDarkMode))
      if (newDarkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
      return { darkMode: newDarkMode }
    })
  },
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userCurrency')
    localStorage.removeItem('darkMode')
    set({ token: null, user: null, isAuthenticated: false, currency: DEFAULT_CURRENCY.code, darkMode: false })
    document.documentElement.classList.remove('dark-mode')
  },
}))
