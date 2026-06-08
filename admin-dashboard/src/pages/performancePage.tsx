import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, LinearProgress } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

const performanceData = [
  { metric: 'Server Response Time', value: 145, max: 500, unit: 'ms', status: 'good' },
  { metric: 'Database Query Time', value: 89, max: 300, unit: 'ms', status: 'good' },
  { metric: 'API Success Rate', value: 99.7, max: 100, unit: '%', status: 'good' },
  { metric: 'Cache Hit Ratio', value: 87, max: 100, unit: '%', status: 'good' },
  { metric: 'Memory Usage', value: 62, max: 100, unit: '%', status: 'warning' },
  { metric: 'CPU Usage', value: 48, max: 100, unit: '%', status: 'good' },
]

export function performancePage() {
  const getColor = (status: string) => status === 'good' ? THEME_PRO.success : status === 'warning' ? THEME_PRO.warning : THEME_PRO.error

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            ⚡ Performance Metrics
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>Monitor system performance in real-time</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {performanceData.map((metric, idx) => (
            <Card key={idx} sx={{ p: SPACING_PRO.xl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.sm }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.md }}>
                <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>{metric.metric}</Typography>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: getColor(metric.status) }}>
                  {metric.value}{metric.unit}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={(metric.value / metric.max) * 100} sx={{ height: '8px', borderRadius: RADIUS_PRO.full, backgroundColor: THEME_PRO.bgTertiary, '& .MuiLinearProgress-bar': { backgroundColor: getColor(metric.status) } }} />
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
