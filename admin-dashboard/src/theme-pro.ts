/**
 * Professional Financial App Theme
 * Modern, clean, professional color scheme
 */

export const THEME_PRO = {
  // Primary colors - Professional Blue
  primary: '#0066FF', // Professional Blue
  primaryDark: '#0052CC',
  primaryLight: '#E6F2FF',

  // Secondary - Teal accent
  secondary: '#00D9FF',

  // Background colors
  bgPrimary: '#F8FAFF', // Very light blue-white
  bgSecondary: '#FFFFFF', // White
  bgTertiary: '#F3F6FB', // Light gray-blue
  bgDark: '#1E293B', // Dark blue-gray (for dark mode)

  // Text colors
  textPrimary: '#0F172A', // Dark navy
  textSecondary: '#475569', // Medium gray
  textTertiary: '#94A3B8', // Light gray
  textInverse: '#FFFFFF', // White on dark backgrounds

  // Status colors
  success: '#10B981', // Green
  successLight: '#D1FAE5',
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7',
  error: '#EF4444', // Red
  errorLight: '#FEE2E2',
  info: '#0066FF', // Blue
  infoLight: '#E6F2FF',

  // Neutral
  border: '#E2E8F0', // Light border
  divider: '#CBD5E1',
  shadow: 'rgba(15, 23, 42, 0.1)',

  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #0066FF 0%, #00D9FF 100%)',
  gradientSuccess: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  gradientWarning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  gradientError: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
}

export const SPACING_PRO = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
}

export const RADIUS_PRO = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}

export const SHADOWS_PRO = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
}

export const TRANSITIONS_PRO = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
}

export const TYPOGRAPHY_PRO = {
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.5,
  },
}
