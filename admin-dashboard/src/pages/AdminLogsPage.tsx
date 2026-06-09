import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material'
import { Refresh } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

export function AdminLogsPage() {
  const [backendLogs, setBackendLogs] = useState<string>('')
  const [frontendLogs, setFrontendLogs] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Fetch backend logs from API
      const response = await fetch('/api/v1/logs?limit=500')
      const data = await response.json()

      // Convert logs array to formatted JSON text
      const logsText = data.data
        .map((log: any) => JSON.stringify(log))
        .join('\n')

      setBackendLogs(logsText)

      // Frontend logs from localStorage
      const storedLogs = localStorage.getItem('app_logs')
      if (storedLogs) {
        try {
          const frontendLogsArray = JSON.parse(storedLogs)
          const frontendText = frontendLogsArray
            .map((log: any) => JSON.stringify(log))
            .join('\n')
          setFrontendLogs(frontendText)
        } catch (e) {
          setFrontendLogs(storedLogs)
        }
      } else {
        setFrontendLogs('No frontend logs yet. Check console for activity.')
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      setBackendLogs('Error loading backend logs')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyBackend = () => {
    navigator.clipboard.writeText(backendLogs)
    alert('Backend logs copied to clipboard!')
  }

  const handleCopyFrontend = () => {
    navigator.clipboard.writeText(frontendLogs)
    alert('Frontend logs copied to clipboard!')
  }

  const handleDownloadBackend = () => {
    const element = document.createElement('a')
    const file = new Blob([backendLogs], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `backend-logs-${new Date().toISOString().split('T')[0]}.log`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadFrontend = () => {
    const element = document.createElement('a')
    const file = new Blob([frontendLogs], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `frontend-logs-${new Date().toISOString().split('T')[0]}.log`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📋 System Logs
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: SPACING_PRO.xxl }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Stack spacing={SPACING_PRO.lg}>
            {/* Backend Logs */}
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                  🖥️ Backend Logs
                </Typography>
                <Stack direction="row" spacing={SPACING_PRO.sm}>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={fetchLogs}
                    sx={{
                      textTransform: 'none',
                      color: THEME_PRO.primary,
                      border: `1px solid ${THEME_PRO.border}`,
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    size="small"
                    onClick={handleCopyBackend}
                    sx={{
                      textTransform: 'none',
                      color: THEME_PRO.primary,
                      border: `1px solid ${THEME_PRO.border}`,
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="small"
                    onClick={handleDownloadBackend}
                    sx={{
                      textTransform: 'none',
                      color: THEME_PRO.primary,
                      border: `1px solid ${THEME_PRO.border}`,
                    }}
                  >
                    Download
                  </Button>
                </Stack>
              </Box>

              <Box
                component="pre"
                sx={{
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textSecondary,
                  p: SPACING_PRO.lg,
                  borderRadius: RADIUS_PRO.md,
                  border: `1px solid ${THEME_PRO.border}`,
                  maxHeight: '600px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                {backendLogs || 'No logs yet...'}
              </Box>
            </Card>

            {/* Frontend Logs */}
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                  🌐 Frontend Logs
                </Typography>
                <Stack direction="row" spacing={SPACING_PRO.sm}>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={fetchLogs}
                    sx={{
                      textTransform: 'none',
                      color: THEME_PRO.primary,
                      border: `1px solid ${THEME_PRO.border}`,
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    size="small"
                    onClick={handleCopyFrontend}
                    sx={{
                      textTransform: 'none',
                      color: THEME_PRO.primary,
                      border: `1px solid ${THEME_PRO.border}`,
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="small"
                    onClick={handleDownloadFrontend}
                    sx={{
                      textTransform: 'none',
                      color: THEME_PRO.primary,
                      border: `1px solid ${THEME_PRO.border}`,
                    }}
                  >
                    Download
                  </Button>
                </Stack>
              </Box>

              <Box
                component="pre"
                sx={{
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textSecondary,
                  p: SPACING_PRO.lg,
                  borderRadius: RADIUS_PRO.md,
                  border: `1px solid ${THEME_PRO.border}`,
                  maxHeight: '600px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                {frontendLogs || 'No frontend logs yet...'}
              </Box>
            </Card>
          </Stack>
        )}
      </Box>
    </LayoutPro>
  )
}
