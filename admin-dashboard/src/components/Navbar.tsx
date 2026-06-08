import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, AppBar, Toolbar } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
        borderBottom: '2px solid #D4AF37',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          minHeight: '64px',
        }}
      >
        {/* Left section - Navigation buttons */}
        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Home button - always visible */}
          <Button
            onClick={() => navigate('/')}
            startIcon={<Home />}
            sx={{
              color: isHome ? '#D4AF37' : '#ffffff',
              backgroundColor: isHome ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              border: isHome ? '1px solid #D4AF37' : '1px solid transparent',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 200ms',
              '&:hover': {
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                borderColor: '#D4AF37',
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
                color: '#ffffff',
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 200ms',
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  borderColor: '#D4AF37',
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
            color: '#D4AF37',
            fontSize: '20px',
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
