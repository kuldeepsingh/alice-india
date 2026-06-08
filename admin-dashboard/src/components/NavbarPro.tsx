import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, AppBar, Toolbar, Avatar } from '@mui/material'
import { ArrowBack, Home, Logout, HelpOutline } from '@mui/icons-material'
import { useAuthStore } from '../state/store'
import { HelpModal } from './HelpModal'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, TRANSITIONS_PRO } from '../theme-pro'

export function NavbarPro() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { logout } = useAuthStore()
  const [helpOpen, setHelpOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: THEME_PRO.bgSecondary,
        borderBottom: `1px solid ${THEME_PRO.border}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: SPACING_PRO.xxl,
          minHeight: '70px',
          gap: SPACING_PRO.lg,
        }}
      >
        {/* Left - Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING_PRO.md,
            cursor: 'pointer',
            transition: TRANSITIONS_PRO.normal,
            '&:hover': { opacity: 0.8 },
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: '40px',
              height: '40px',
              background: THEME_PRO.gradientPrimary,
              borderRadius: THEME_PRO.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: THEME_PRO.textInverse,
            }}
          >
            📈
          </Box>
          <Box>
            <Box sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
              BOT-TRADE
            </Box>
            <Box sx={{ fontSize: '11px', color: THEME_PRO.textTertiary, fontWeight: 500 }}>
              Professional Trading
            </Box>
          </Box>
        </Box>

        {/* Center - Navigation */}
        <Box sx={{ display: 'flex', gap: SPACING_PRO.sm, alignItems: 'center', flex: 1 }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<Home sx={{ fontSize: '20px' }} />}
            sx={{
              color: isHome ? THEME_PRO.primary : THEME_PRO.textSecondary,
              backgroundColor: isHome ? THEME_PRO.primaryLight : 'transparent',
              textTransform: 'none',
              fontWeight: isHome ? 600 : 500,
              fontSize: '14px',
              px: SPACING_PRO.lg,
              py: SPACING_PRO.md,
              borderRadius: RADIUS_PRO.md,
              border: isHome ? `1px solid ${THEME_PRO.primaryLight}` : 'none',
              transition: TRANSITIONS_PRO.normal,
              '&:hover': {
                backgroundColor: THEME_PRO.primaryLight,
                color: THEME_PRO.primary,
              },
            }}
          >
            Home
          </Button>

          {!isHome && (
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack sx={{ fontSize: '18px' }} />}
              sx={{
                color: THEME_PRO.textSecondary,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                px: SPACING_PRO.lg,
                py: SPACING_PRO.md,
                borderRadius: RADIUS_PRO.md,
                transition: TRANSITIONS_PRO.normal,
                '&:hover': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.primary,
                },
              }}
            >
              Back
            </Button>
          )}
        </Box>

        {/* Right - User Actions */}
        <Box sx={{ display: 'flex', gap: SPACING_PRO.lg, alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: THEME_PRO.gradientPrimary,
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: TRANSITIONS_PRO.normal,
              '&:hover': { transform: 'scale(1.1)' },
            }}
          >
            A
          </Avatar>

          <Button
            onClick={() => setHelpOpen(true)}
            startIcon={<HelpOutline sx={{ fontSize: '18px' }} />}
            sx={{
              color: THEME_PRO.primary,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              px: SPACING_PRO.lg,
              py: SPACING_PRO.md,
              borderRadius: RADIUS_PRO.md,
              border: `1px solid ${THEME_PRO.border}`,
              transition: TRANSITIONS_PRO.normal,
              '&:hover': {
                backgroundColor: THEME_PRO.primaryLight,
                borderColor: THEME_PRO.primary,
              },
            }}
          >
            Help
          </Button>

          <Button
            onClick={handleLogout}
            startIcon={<Logout sx={{ fontSize: '18px' }} />}
            sx={{
              color: THEME_PRO.error,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              px: SPACING_PRO.lg,
              py: SPACING_PRO.md,
              borderRadius: RADIUS_PRO.md,
              border: `1px solid ${THEME_PRO.border}`,
              transition: TRANSITIONS_PRO.normal,
              '&:hover': {
                backgroundColor: THEME_PRO.errorLight,
                borderColor: THEME_PRO.error,
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} currentPage={location.pathname} />
    </AppBar>
  )
}
