import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, LinearProgress } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

export function analyticsPage() {
  const metrics = [
    { label: 'Total Trades', value: '234', change: '+12%', icon: '📈' },
    { label: 'Win Rate', value: '67.5%', change: '+5%', icon: '🎯' },
    { label: 'Avg Return', value: '3.2%', change: '+0.8%', icon: '💰' },
    { label: 'Risk/Reward', value: '1:2.5', change: 'Optimal', icon: '⚖️' },
  ]

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📊 Analytics & Reports
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>View detailed trading analytics</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: SPACING_PRO.xxxl }}>
          {metrics.map((metric, idx) => (
            <Card key={idx} sx={{ p: SPACING_PRO.xl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.sm }}>
              <Typography sx={{ fontSize: '28px', mb: SPACING_PRO.sm }}>{metric.icon}</Typography>
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textTertiary, textTransform: 'uppercase', fontWeight: 600, mb: SPACING_PRO.sm }}>
                {metric.label}
              </Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 700, color: THEME_PRO.primary, mb: SPACING_PRO.sm }}>
                {metric.value}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.success, fontWeight: 600 }}>
                {metric.change}
              </Typography>
            </Card>
          ))}
        </Box>

        <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
            Performance by Strategy
          </Typography>
          {['Trend Following', 'Mean Reversion', 'Momentum Trading', 'Swing Trading'].map((strategy, idx) => (
            <Box key={idx} sx={{ mb: SPACING_PRO.lg }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.sm }}>
                <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>{strategy}</Typography>
                <Typography sx={{ fontWeight: 600, color: THEME_PRO.primary }}>{75 - idx * 10}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={75 - idx * 10} sx={{ height: '8px', borderRadius: RADIUS_PRO.full, backgroundColor: THEME_PRO.bgTertiary, '& .MuiLinearProgress-bar': { background: THEME_PRO.gradientPrimary } }} />
            </Box>
          ))}
        </Card>
      </Box>
    </LayoutPro>
  )
}
