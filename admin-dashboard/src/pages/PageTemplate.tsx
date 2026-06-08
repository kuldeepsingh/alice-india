import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

interface PageProps {
  title: string
  subtitle: string
  icon: string
}

export function PageTemplate({ title, subtitle, icon }: PageProps) {
  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            {icon} {title}
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>
            {subtitle}
          </Typography>
        </Box>
        <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
          <Typography sx={{ color: THEME_PRO.textSecondary, mb: SPACING_PRO.lg }}>
            Content coming soon...
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: THEME_PRO.primary, color: '#fff', textTransform: 'none' }}>
            Get Started
          </Button>
        </Card>
      </Box>
    </LayoutPro>
  )
}
