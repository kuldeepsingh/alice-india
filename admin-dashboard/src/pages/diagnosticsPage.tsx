import React, { useState } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Chip, LinearProgress } from '@mui/material'
import { PlayArrow, CheckCircle, ErrorOutlined, Schedule } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const tests = [
  { name: 'Backend API Health', status: 'passed', duration: '125ms' },
  { name: 'Database Connection', status: 'passed', duration: '85ms' },
  { name: 'Trading API Connection', status: 'warning', duration: '2500ms' },
  { name: 'Cache Server', status: 'passed', duration: '45ms' },
  { name: 'Credential Encryption', status: 'passed', duration: '320ms' },
]

export function diagnosticsPage() {
  const [running, setRunning] = useState(false)
  const getStatusIcon = (status: string) => {
    if (status === 'passed') return <CheckCircle sx={{ color: THEME_PRO.success }} />
    if (status === 'warning') return <Schedule sx={{ color: THEME_PRO.warning }} />
    return <ErrorOutlined sx={{ color: THEME_PRO.error }} />
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
              🧪 Diagnostics
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary }}>Run system health checks</Typography>
          </Box>
          <Button variant="contained" startIcon={<PlayArrow />} onClick={() => setRunning(!running)} sx={{ backgroundColor: THEME_PRO.primary, color: '#fff' }}>
            {running ? 'Running...' : 'Run Tests'}
          </Button>
        </Box>

        {running && <LinearProgress sx={{ mb: SPACING_PRO.lg }} />}

        <Box sx={{ display: 'grid', gap: 2 }}>
          {tests.map((test, idx) => (
            <Card key={idx} sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING_PRO.lg }}>
                {getStatusIcon(test.status)}
                <Box>
                  <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>{test.name}</Typography>
                  <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>Response time: {test.duration}</Typography>
                </Box>
              </Box>
              <Chip label={test.status} sx={{ backgroundColor: test.status === 'passed' ? THEME_PRO.successLight : THEME_PRO.warningLight, color: test.status === 'passed' ? THEME_PRO.success : THEME_PRO.warning }} />
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
