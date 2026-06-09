/**
 * Professional Financial App Theme
 * Modern, clean, professional color scheme with dark mode support
 */

const LIGHT_THEME = {
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

const DARK_THEME = {
  // Primary colors - EquiLytics Professional Blue
  primary: '#2196F3', // Professional Blue (brighter for dark background)
  primaryDark: '#1565c0',
  primaryLight: '#64B5F6',

  // Secondary - Cyan accent
  secondary: '#00BCD4',

  // Background colors - EquiLytics dark theme
  bgPrimary: '#0a0a0a', // Very dark (almost black) - main background
  bgSecondary: '#1a1a1a', // Dark gray - cards and containers
  bgTertiary: '#2a2a2a', // Medium dark - subtle backgrounds

  // Text colors - EquiLytics styling
  textPrimary: '#ffffff', // Pure white
  textSecondary: '#B0B0B0', // Medium gray (improved contrast)
  textTertiary: '#808080', // Light gray (improved contrast)
  textInverse: '#0a0a0a', // Dark on light backgrounds

  // Status colors - EquiLytics market colors
  success: '#4caf50', // Green for gains/positive
  successLight: '#0d3a0d', // Dark green background for tiles
  warning: '#ffa500', // Orange for warnings
  warningLight: '#3a2a0d', // Dark orange background
  error: '#f44336', // Red for losses/negative
  errorLight: '#3a0d0d', // Dark red background for tiles
  info: '#2196F3', // Blue for info (matches primary)
  infoLight: '#1a3a5f', // Dark blue background

  // Neutral - EquiLytics subtle styling
  border: '#333333', // Slightly lighter borders for better visibility
  divider: '#333333', // Same as border
  shadow: 'rgba(0, 0, 0, 0.6)',

  // Gradients (EquiLytics style - updated for new primary)
  gradientPrimary: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)',
  gradientSuccess: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
  gradientWarning: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)',
  gradientError: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
}

export const getTheme = (darkMode: boolean = true) => {
  return darkMode ? DARK_THEME : LIGHT_THEME
}

export const THEME_PRO = DARK_THEME // Default to EquiLytics dark theme

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
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.6)',
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
    letterSpacing: '-0.5px',
  },
  h2: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.3px',
  },
  h3: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.2px',
  },
  h4: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
}

// Component styling standards
export const COMPONENT_STYLES_PRO = {
  button: {
    height: '44px',
    borderRadius: RADIUS_PRO.md,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '14px',
    transition: TRANSITIONS_PRO.normal,
  },
  buttonSmall: {
    height: '36px',
    borderRadius: RADIUS_PRO.sm,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '13px',
  },
  input: {
    height: '44px',
    borderRadius: RADIUS_PRO.md,
    fontSize: '14px',
  },
  inputSmall: {
    height: '36px',
    borderRadius: RADIUS_PRO.sm,
    fontSize: '13px',
  },
  card: {
    borderRadius: RADIUS_PRO.lg,
    border: `1px solid ${DARK_THEME.border}`,
    boxShadow: SHADOWS_PRO.md,
    transition: TRANSITIONS_PRO.normal,
  },
  table: {
    headerHeight: '48px',
    rowHeight: '56px',
  },
}
