import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const logs = [
  { time: '14:32:45', level: 'INFO', module: 'API', message: 'User logged in successfully' },
  { time: '14:31:20', level: 'DEBUG', module: 'DB', message: 'Database query executed' },
  { time: '14:30:15', level: 'WARNING', module: 'CACHE', message: 'Cache miss on key: user_123' },
  { time: '14:29:00', level: 'ERROR', module: 'API', message: 'Failed to fetch external API' },
  { time: '14:28:30', level: 'INFO', module: 'ORDER', message: 'Order placed successfully' },
]

export function logsPage() {
  const getLevelColor = (level: string) => {
    const colors: {[key: string]: string} = { 'INFO': THEME_PRO.info, 'DEBUG': THEME_PRO.secondary, 'WARNING': THEME_PRO.warning, 'ERROR': THEME_PRO.error }
    return colors[level] || THEME_PRO.textSecondary
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📋 System Logs
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>View real-time system logs</Typography>
        </Box>

        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Module</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, idx) => (
                  <TableRow key={idx} sx={{ borderBottom: `1px solid ${THEME_PRO.border}` }}>
                    <TableCell sx={{ color: THEME_PRO.textSecondary, fontFamily: 'monospace' }}>{log.time}</TableCell>
                    <TableCell><Chip label={log.level} sx={{ color: getLevelColor(log.level), backgroundColor: getLevelColor(log.level) + '20' }} /></TableCell>
                    <TableCell sx={{ color: THEME_PRO.primary, fontWeight: 600 }}>{log.module}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </LayoutPro>
  )
}
