/**
 * Unified Theme Configuration
 * Ensures consistent styling and colors across all pages
 */

export const COLORS = {
  // Primary colors
  primary: '#D4AF37', // Gold accent
  primaryDark: '#B8860B', // Darker gold
  primaryLight: 'rgba(212, 175, 55, 0.1)', // Light gold background

  // Background colors
  bgDark: '#1a1a1a', // Very dark background
  bgDarker: '#0f0f0f', // Darker background
  bgMedium: '#2a2a2a', // Medium dark background
  bgLight: '#3a3a3a', // Light dark background

  // Text colors
  textPrimary: '#ffffff', // White text
  textSecondary: '#d1d5db', // Light gray text
  textTertiary: '#9ca3af', // Medium gray text
  textDimmed: '#6b7280', // Dimmed gray text

  // Status colors
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  error: '#ef4444', // Red
  info: '#3b82f6', // Blue

  // Log levels
  logDebug: '#90CAF9', // Light blue
  logDebugBg: '#E3F2FD', // Light blue background
  logInfo: '#A5D6A7', // Light green
  logInfoBg: '#E8F5E9', // Light green background
  logWarn: '#FFD54F', // Yellow
  logWarnBg: '#FFFDE7', // Yellow background
  logError: '#EF5350', // Light red
  logErrorBg: '#FFEBEE', // Light red background
  logFatal: '#C62828', // Dark red
  logFatalBg: '#B71C1C', // Dark red background
} as const

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
} as const

export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const

export const SHADOWS = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 25px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.4)',
} as const

export const TRANSITIONS = {
  fast: '100ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const

// Layout constants
export const NAVBAR_HEIGHT = '64px'
export const SIDEBAR_WIDTH = '256px'
