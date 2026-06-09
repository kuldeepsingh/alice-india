import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'
import { auditAPI } from '../services/api-services'

export function auditPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true)
        setError('')
        const logs = await auditAPI.getAll(100)
        setAuditLogs(logs)
      } catch (err) {
        setError('Failed to load audit logs. Please try again.')
        console.error('Error fetching audit logs:', err)
        setAuditLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📄 Audit Trail
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>View user actions and system events</Typography>
        </Box>

        {error && (
          <Alert sx={{ mb: SPACING_PRO.lg, backgroundColor: THEME_PRO.errorLight, color: THEME_PRO.error, border: `1px solid ${THEME_PRO.error}` }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: SPACING_PRO.xxxl }}>
            <CircularProgress sx={{ color: THEME_PRO.primary }} />
          </Box>
        ) : auditLogs.length === 0 ? (
          <Card sx={{ p: SPACING_PRO.xxxl, borderRadius: RADIUS_PRO.lg, backgroundColor: THEME_PRO.bgSecondary, border: `1px solid ${THEME_PRO.border}` }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>No audit logs found</Typography>
            </Box>
          </Card>
        ) : (
          <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log, idx) => (
                    <TableRow key={idx} sx={{ borderBottom: `1px solid ${THEME_PRO.border}` }}>
                      <TableCell sx={{ color: THEME_PRO.textSecondary, fontSize: '13px' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : log.time}
                      </TableCell>
                      <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>
                        {log.action || log.type}
                      </TableCell>
                      <TableCell sx={{ color: THEME_PRO.primary }}>
                        {log.user || log.userId || 'System'}
                      </TableCell>
                      <TableCell sx={{ color: THEME_PRO.textSecondary }}>
                        {log.details || log.description || JSON.stringify(log).substring(0, 50)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>
    </LayoutPro>
  )
}
