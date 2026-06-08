import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Breadcrumb } from './Breadcrumb'
import { Box } from '@mui/material'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      {/* <Breadcrumb /> */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
