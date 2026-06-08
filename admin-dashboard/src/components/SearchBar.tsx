import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  InputBase,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Search as SearchIcon, Dashboard, Settings } from '@mui/icons-material'
import { COLORS, SPACING, TRANSITIONS } from '../theme'

interface PageResult {
  label: string
  path: string
  icon: React.ReactNode
  keywords: string[]
}

const PAGES_REGISTRY: PageResult[] = [
  { label: 'Dashboard', path: '/', icon: <Dashboard />, keywords: ['home', 'dashboard', 'overview'] },
  { label: 'Users', path: '/users', icon: '👥', keywords: ['users', 'team', 'members'] },
  { label: 'Accounts', path: '/accounts', icon: '💼', keywords: ['accounts', 'trading'] },
  { label: 'Orders', path: '/orders', icon: '📈', keywords: ['orders', 'trades'] },
  { label: 'Analytics', path: '/analytics', icon: '📉', keywords: ['analytics', 'reports', 'data'] },
  { label: 'Trading', path: '/trading', icon: '📊', keywords: ['trading', 'portfolio'] },
  { label: 'Settings', path: '/settings', icon: <Settings />, keywords: ['settings', 'config', 'preferences'] },
  { label: 'Diagnostics', path: '/diagnostics', icon: <Diagnostics />, keywords: ['diagnostics', 'testing', 'health'] },
  { label: 'Logs', path: '/logs', icon: '📋', keywords: ['logs', 'debugging'] },
  { label: 'Errors', path: '/errors', icon: '🚨', keywords: ['errors', 'failures'] },
  { label: 'Audit Trail', path: '/audit', icon: '📄', keywords: ['audit', 'history'] },
  { label: 'Debug Sessions', path: '/debug', icon: '🐛', keywords: ['debug', 'sessions'] },
  { label: 'Incidents', path: '/incidents', icon: '🔴', keywords: ['incidents', 'issues'] },
]

export function SearchBar() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return PAGES_REGISTRY.filter(
      (page) =>
        page.label.toLowerCase().includes(lowerQuery) ||
        page.keywords.some((k) => k.includes(lowerQuery))
    ).slice(0, 5)
  }, [query])

  const handleSelect = (path: string) => {
    navigate(path)
    setQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <Box sx={{ flex: 1, mx: 2, position: 'relative' }}>
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: `${SPACING.sm} ${SPACING.md}`,
          backgroundColor: COLORS.bgMedium,
          border: `1px solid ${COLORS.primary}`,
          borderRadius: '8px',
          transition: TRANSITIONS.normal,
          '&:hover': {
            backgroundColor: COLORS.bgLight,
          },
          '&:focus-within': {
            backgroundColor: COLORS.bgLight,
            boxShadow: `0 0 0 2px ${COLORS.primary}40`,
          },
        }}
      >
        <SearchIcon sx={{ color: COLORS.primary, mr: SPACING.sm }} />
        <InputBase
          placeholder="Search pages..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          sx={{
            flex: 1,
            color: COLORS.textPrimary,
            '& input::placeholder': {
              color: COLORS.textTertiary,
              opacity: 0.7,
            },
            '& input': {
              fontSize: '14px',
            },
          }}
        />
      </Paper>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || query.trim()) && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            backgroundColor: COLORS.bgMedium,
            border: `1px solid ${COLORS.primary}`,
            borderRadius: '8px',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {results.length > 0 ? (
            <List sx={{ p: 0 }}>
              {results.map((result) => (
                <ListItem
                  key={result.path}
                  onClick={() => handleSelect(result.path)}
                  sx={{
                    cursor: 'pointer',
                    transition: TRANSITIONS.fast,
                    '&:hover': {
                      backgroundColor: COLORS.bgLight,
                      borderLeftColor: COLORS.primary,
                      borderLeft: `4px solid ${COLORS.primary}`,
                      pl: `calc(16px - 4px)`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: COLORS.primary }}>
                    {typeof result.icon === 'string' ? result.icon : result.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.label}
                    sx={{ '& .MuiTypography-root': { color: COLORS.textPrimary } }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: SPACING.lg, textAlign: 'center', color: COLORS.textTertiary }}>
              No pages found
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
