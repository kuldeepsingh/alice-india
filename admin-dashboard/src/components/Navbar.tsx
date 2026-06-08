import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, AppBar, Toolbar } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'
import { COLORS, TRANSITIONS, SPACING } from '../theme'

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <AppBar
      position="static"
      sx={{
        background: `linear-gradient(to right, ${COLORS.bgDark}, ${COLORS.bgMedium})`,
        borderBottom: `2px solid ${COLORS.primary}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: SPACING.md,
          minHeight: '64px',
          px: SPACING.lg,
        }}
      >
        {/* Left section - Navigation buttons */}
        <Box sx={{ display: 'flex', gap: SPACING.sm, alignItems: 'center' }}>
          {/* Home button - always visible */}
          <Button
            onClick={() => navigate('/')}
            startIcon={<Home />}
            sx={{
              color: isHome ? COLORS.primary : COLORS.textPrimary,
              backgroundColor: isHome ? COLORS.primaryLight : 'transparent',
              border: isHome ? `1px solid ${COLORS.primary}` : '1px solid transparent',
              padding: `${SPACING.sm} ${SPACING.md}`,
              fontSize: '14px',
              fontWeight: '500',
              transition: TRANSITIONS.normal,
              '&:hover': {
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                borderColor: COLORS.primary,
              },
            }}
          >
            Home
          </Button>

          {/* Back button - hidden on home page */}
          {!isHome && (
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack />}
              sx={{
                color: COLORS.textPrimary,
                backgroundColor: COLORS.primaryLight,
                border: `1px solid ${COLORS.primary}40`,
                padding: `${SPACING.sm} ${SPACING.md}`,
                fontSize: '14px',
                fontWeight: '500',
                transition: TRANSITIONS.normal,
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  borderColor: COLORS.primary,
                },
              }}
            >
              Back
            </Button>
          )}
        </Box>

        {/* Center section - Page title */}
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            color: COLORS.primary,
            fontSize: '18px',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}
        >
          {location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).replace(/-/g, ' ')}
        </Box>

        {/* Right section - Empty for balance */}
        <Box sx={{ width: '120px' }} />
      </Toolbar>
    </AppBar>
  )
}
