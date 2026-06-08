import React from 'react'
import { Box } from '@mui/material'
import { NavbarPro } from './NavbarPro'
import { SidebarPro } from './SidebarPro'
import { THEME_PRO } from '../theme-pro'

interface LayoutProProps {
  children: React.ReactNode
}

export function LayoutPro({ children }: LayoutProProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: THEME_PRO.bgPrimary }}>
      <NavbarPro />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SidebarPro />
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: THEME_PRO.bgPrimary,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
