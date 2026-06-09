import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, AppBar, Toolbar, Avatar, IconButton, TextField, InputAdornment } from '@mui/material'
import { ArrowBack, Home, Logout, HelpOutlined, Brightness4, Brightness7, Search, Close } from '@mui/icons-material'
import { useAuthStore } from '../state/store'
import { HelpModal } from './HelpModal'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, TRANSITIONS_PRO, SHADOWS_PRO } from '../theme-pro'

export function NavbarPro() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { logout, darkMode, toggleDarkMode } = useAuthStore()
  const [helpOpen, setHelpOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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
          {/* Search Bar - Expandable */}
          {searchOpen ? (
            <TextField
              autoFocus
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              sx={{
                width: '250px',
                transition: TRANSITIONS_PRO.normal,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  height: '40px',
                  '& fieldset': { borderColor: THEME_PRO.primary },
                  '&:hover fieldset': { borderColor: THEME_PRO.primary },
                  '&.Mui-focused fieldset': { borderColor: THEME_PRO.primary },
                },
                '& .MuiOutlinedInput-input': {
                  color: THEME_PRO.textPrimary,
                  '&::placeholder': {
                    color: THEME_PRO.textSecondary,
                    opacity: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: '18px', color: THEME_PRO.primary, mr: SPACING_PRO.sm }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchValue('')
                      }}
                      sx={{ color: THEME_PRO.textSecondary }}
                    >
                      <Close sx={{ fontSize: '18px' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <IconButton
              onClick={() => setSearchOpen(true)}
              title="Search"
              sx={{
                color: THEME_PRO.primary,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: RADIUS_PRO.md,
                border: `1px solid ${THEME_PRO.border}`,
                transition: TRANSITIONS_PRO.normal,
                '&:hover': {
                  backgroundColor: THEME_PRO.primaryLight,
                  borderColor: THEME_PRO.primary,
                },
              }}
            >
              <Search sx={{ fontSize: '20px' }} />
            </IconButton>
          )}

          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{
              color: THEME_PRO.primary,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: RADIUS_PRO.md,
              border: `1px solid ${THEME_PRO.border}`,
              transition: TRANSITIONS_PRO.normal,
              '&:hover': {
                backgroundColor: THEME_PRO.primaryLight,
                borderColor: THEME_PRO.primary,
              },
            }}
          >
            {darkMode ? <Brightness7 sx={{ fontSize: '20px' }} /> : <Brightness4 sx={{ fontSize: '20px' }} />}
          </IconButton>

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
            startIcon={<HelpOutlined sx={{ fontSize: '18px' }} />}
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
