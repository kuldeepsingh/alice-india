import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Refresh } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO, TRANSITIONS_PRO } from '../theme-pro'

type LogLevel = 'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export function AdminLogsPage() {
  const [backendLogs, setBackendLogs] = useState<string>('')
  const [frontendLogs, setFrontendLogs] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [backendRawLogs, setBackendRawLogs] = useState<any[]>([])
  const [frontendRawLogs, setFrontendRawLogs] = useState<any[]>([])
  const [backendFilter, setBackendFilter] = useState<LogLevel>('ALL')
  const [frontendFilter, setFrontendFilter] = useState<LogLevel>('ALL')

  useEffect(() => {
    fetchLogs()
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  // Filter logs by level
  const filterLogsByLevel = (logs: any[], level: LogLevel): string => {
    let filtered = logs
    if (level !== 'ALL') {
      filtered = logs.filter((log: any) => log.level === level)
    }
    return filtered.map((log: any) => JSON.stringify(log)).join('\n') || 'No logs found'
  }

  // Update displayed logs when filter changes
  useEffect(() => {
    setBackendLogs(filterLogsByLevel(backendRawLogs, backendFilter))
  }, [backendFilter, backendRawLogs])

  useEffect(() => {
    setFrontendLogs(filterLogsByLevel(frontendRawLogs, frontendFilter))
  }, [frontendFilter, frontendRawLogs])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Fetch backend logs from API
      const response = await fetch('/api/v1/logs?limit=500')
      const data = await response.json()

      // Store raw logs
      setBackendRawLogs(data.data || [])

      // Frontend logs from localStorage
      const storedLogs = localStorage.getItem('app_logs')
      if (storedLogs) {
        try {
          const frontendLogsArray = JSON.parse(storedLogs)
          setFrontendRawLogs(frontendLogsArray)
        } catch (e) {
          setFrontendLogs('Error parsing frontend logs')
        }
      } else {
        setFrontendRawLogs([])
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
      <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            📋 System Logs
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, display: 'flex', justifyContent: 'center', p: SPACING_PRO.xxl }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Stack spacing={SPACING_PRO.lg}>
            {/* Frontend Logs */}
            <Card sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, display: 'flex', alignItems: 'center', gap: SPACING_PRO.lg }}>
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                    🌐 Frontend Logs
                  </Typography>
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ fontSize: '14px' }}>Filter Level</InputLabel>
                    <Select
                      value={frontendFilter}
                      label="Filter Level"
                      onChange={(e) => setFrontendFilter(e.target.value as LogLevel)}
                      sx={{
                        backgroundColor: THEME_PRO.bgTertiary,
                        fontSize: '14px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME_PRO.border },
                      }}
                    >
                      <MenuItem value="ALL">All Levels</MenuItem>
                      <MenuItem value="DEBUG">DEBUG</MenuItem>
                      <MenuItem value="INFO">INFO</MenuItem>
                      <MenuItem value="WARN">WARN</MenuItem>
                      <MenuItem value="ERROR">ERROR</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
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

            {/* Backend Logs */}
            <Card sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING_PRO.lg }}>
                <Box sx={{ backgroundColor: THEME_PRO.bgSecondary, display: 'flex', alignItems: 'center', gap: SPACING_PRO.lg }}>
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary }}>
                    🖥️ Backend Logs
                  </Typography>
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ fontSize: '14px' }}>Filter Level</InputLabel>
                    <Select
                      value={backendFilter}
                      label="Filter Level"
                      onChange={(e) => setBackendFilter(e.target.value as LogLevel)}
                      sx={{
                        backgroundColor: THEME_PRO.bgTertiary,
                        fontSize: '14px',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME_PRO.border },
                      }}
                    >
                      <MenuItem value="ALL">All Levels</MenuItem>
                      <MenuItem value="DEBUG">DEBUG</MenuItem>
                      <MenuItem value="INFO">INFO</MenuItem>
                      <MenuItem value="WARN">WARN</MenuItem>
                      <MenuItem value="ERROR">ERROR</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
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
          </Stack>
        )}
      </Box>
    </LayoutPro>
  )
}
