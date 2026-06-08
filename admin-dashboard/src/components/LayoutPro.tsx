import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import { NavbarPro } from './NavbarPro'
import { SidebarPro } from './SidebarPro'
import { THEME_PRO, getTheme } from '../theme-pro'
import { useAuthStore } from '../state/store'

interface LayoutProProps {
  children: React.ReactNode
}

export function LayoutPro({ children }: LayoutProProps) {
  const { darkMode } = useAuthStore()
  const theme = getTheme(darkMode)

  // Initialize dark mode on component mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.bgPrimary }}>
      <NavbarPro />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SidebarPro />
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: theme.bgPrimary,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
