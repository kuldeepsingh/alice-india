import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Typography,
  ListItemIcon,
} from '@mui/material'
import { Logout, Settings, Person } from '@mui/icons-material'
import { COLORS, SPACING } from '../theme'

export function UserProfileDropdown() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleMenuClose()
  }

  const handleSettings = () => {
    navigate('/settings')
    handleMenuClose()
  }

  // Get user initials or default
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    const parts = user.email.split('@')[0].split('.')
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2)
  }

  const userEmail = user?.email || 'user@example.com'
  const userInitials = getUserInitials()

  return (
    <Box>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: SPACING.sm,
          border: `2px solid ${COLORS.primary}`,
          borderRadius: '50%',
          transition: 'all 200ms',
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            transform: 'scale(1.05)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: COLORS.primary,
            color: COLORS.bgDark,
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {userInitials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: COLORS.bgMedium,
            border: `1px solid ${COLORS.primary}`,
            borderRadius: '8px',
            minWidth: '220px',
          },
        }}
      >
        {/* User Info Header */}
        <MenuItem disabled sx={{ flexDirection: 'column', alignItems: 'flex-start', py: SPACING.lg }}>
          <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 'bold' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textTertiary, mt: SPACING.xs }}>
            {userEmail}
          </Typography>
        </MenuItem>

        <Divider sx={{ borderColor: `${COLORS.primary}40`, my: SPACING.sm }} />

        {/* Menu Items */}
        <MenuItem
          onClick={handleSettings}
          sx={{
            color: COLORS.textPrimary,
            transition: 'all 200ms',
            '&:hover': {
              backgroundColor: `${COLORS.primary}20`,
              color: COLORS.primary,
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Settings fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>

        <Divider sx={{ borderColor: `${COLORS.primary}40`, my: SPACING.sm }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            color: COLORS.error,
            transition: 'all 200ms',
            '&:hover': {
              backgroundColor: `${COLORS.error}20`,
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}
