import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const incidents = [
  { id: 'INC001', title: 'Database Connection Timeout', severity: 'high', status: 'Open', created: '2024-06-08 10:15' },
  { id: 'INC002', title: 'High Latency on Trading API', severity: 'medium', status: 'Investigating', created: '2024-06-08 09:30' },
  { id: 'INC003', title: 'Cache Server Failure', severity: 'critical', status: 'Resolved', created: '2024-06-07 15:45' },
]

export function incidentsPage() {
  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            🔴 Incidents
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>Track and manage system incidents</Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          {incidents.map((incident) => (
            <Card key={incident.id} sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: SPACING_PRO.lg, alignItems: 'center' }}>
                <Typography sx={{ fontSize: '24px' }}>⚠️</Typography>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>{incident.title}</Typography>
                  <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>{incident.id} • Created: {incident.created}</Typography>
                </Box>
                <Chip label={incident.severity} sx={{ backgroundColor: incident.severity === 'critical' ? THEME_PRO.errorLight : THEME_PRO.warningLight, color: incident.severity === 'critical' ? THEME_PRO.error : THEME_PRO.warning }} />
                <Chip label={incident.status} sx={{ backgroundColor: incident.status === 'Resolved' ? THEME_PRO.successLight : THEME_PRO.infoLight, color: incident.status === 'Resolved' ? THEME_PRO.success : THEME_PRO.info }} />
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
