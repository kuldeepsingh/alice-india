import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import {
  Box,
  Card,
  Typography,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  CircularProgress,
} from '@mui/material'
import { ExpandMore, Close } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

interface ErrorLog {
  timestamp: string
  level: string
  module: string
  message: string
  context?: Record<string, any>
  stackTrace?: string
}

interface ErrorGroup {
  errorType: string
  errorMessage: string
  count: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  lastOccurrence: string
  occurrences: ErrorLog[]
}

export function errorsPage() {
  const [errors, setErrors] = useState<ErrorGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<ErrorGroup | null>(null)
  const [filterLevel, setFilterLevel] = useState('ERROR')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchErrors()
    const interval = setInterval(fetchErrors, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [filterLevel, searchTerm])

  const fetchErrors = async () => {
    setLoading(true)
    try {
      // Fetch error logs (level ERROR or FATAL)
      const response = await fetch(`/api/v1/logs?limit=500&level=${filterLevel}`)
      const data = await response.json()

      const errorLogs = data.data || []

      // Group errors by message
      const grouped: { [key: string]: ErrorLog[] } = {}
      errorLogs.forEach((log: ErrorLog) => {
        if (log.level === 'ERROR' || log.level === 'FATAL') {
          const key = log.message
          if (!grouped[key]) {
            grouped[key] = []
          }
          grouped[key].push(log)
        }
      })

      // Convert to error groups
      const errorGroups: ErrorGroup[] = Object.entries(grouped).map(([message, logs]) => {
        const severity = logs[0].level === 'FATAL' ? 'critical' : logs.length > 5 ? 'high' : logs.length > 2 ? 'medium' : 'low'
        return {
          errorType: logs[0].module || 'Unknown',
          errorMessage: message,
          count: logs.length,
          severity,
          lastOccurrence: logs[0].timestamp,
          occurrences: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        }
      })

      // Sort by most recent
      errorGroups.sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())

      setErrors(errorGroups)
    } catch (error) {
      console.error('Failed to fetch errors:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: THEME_PRO.error,
      high: THEME_PRO.error,
      medium: THEME_PRO.warning,
      low: THEME_PRO.info,
    }
    return colors[severity] || THEME_PRO.textSecondary
  }

  const getSeverityEmoji = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴'
      case 'high':
        return '🟠'
      case 'medium':
        return '🟡'
      default:
        return '🟢'
    }
  }

  const filteredErrors = errors.filter((err) => {
    if (searchTerm) {
      return (
        err.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        err.errorType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return true
  })

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            🚨 Error Tracking
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>
            Monitor and debug system errors with detailed context information
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ p: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, mb: SPACING_PRO.lg }}>
          <Stack direction="row" spacing={SPACING_PRO.lg}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Error Level</InputLabel>
              <Select
                value={filterLevel}
                label="Error Level"
                onChange={(e) => setFilterLevel(e.target.value)}
                sx={{
                  backgroundColor: THEME_PRO.bgTertiary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME_PRO.border },
                }}
              >
                <MenuItem value="ERROR">ERROR</MenuItem>
                <MenuItem value="FATAL">FATAL</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder="Search errors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                },
              }}
            />
            <Button onClick={fetchErrors} sx={{ color: THEME_PRO.primary }}>
              Refresh
            </Button>
          </Stack>
        </Card>

        {/* Errors List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: SPACING_PRO.xxl }}>
            <CircularProgress />
          </Box>
        ) : filteredErrors.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: THEME_PRO.textSecondary, py: SPACING_PRO.xxl }}>
            No errors found
          </Typography>
        ) : (
          <Stack spacing={SPACING_PRO.lg}>
            {filteredErrors.map((error, idx) => (
              <Card
                key={idx}
                sx={{
                  p: SPACING_PRO.lg,
                  borderRadius: RADIUS_PRO.lg,
                  border: `1px solid ${THEME_PRO.border}`,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: THEME_PRO.bgTertiary },
                }}
                onClick={() => setSelectedGroup(error)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING_PRO.md, mb: SPACING_PRO.sm }}>
                      <Typography sx={{ fontSize: '20px' }}>
                        {getSeverityEmoji(error.severity)}
                      </Typography>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: THEME_PRO.textPrimary, fontSize: '16px' }}>
                          {error.errorType}
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary, mt: SPACING_PRO.xs }}>
                          {error.errorMessage}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mt: SPACING_PRO.md }}>
                      Occurrences: <strong>{error.count}</strong> | Last: <strong>{new Date(error.lastOccurrence).toLocaleString()}</strong>
                    </Typography>
                  </Box>
                  <Chip
                    label={error.severity}
                    sx={{
                      color: getSeverityColor(error.severity),
                      backgroundColor: getSeverityColor(error.severity) + '20',
                      ml: SPACING_PRO.lg,
                    }}
                  />
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {/* Error Details Dialog */}
        <Dialog open={selectedGroup !== null} onClose={() => setSelectedGroup(null)} maxWidth="lg" fullWidth>
          {selectedGroup && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
                    {selectedGroup.errorType}: {selectedGroup.errorMessage}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mt: SPACING_PRO.xs }}>
                    {selectedGroup.count} occurrences
                  </Typography>
                </Box>
                <Button onClick={() => setSelectedGroup(null)} sx={{ minWidth: 'auto' }}>
                  <Close />
                </Button>
              </DialogTitle>
              <DialogContent sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                <Stack spacing={SPACING_PRO.lg} sx={{ mt: SPACING_PRO.lg }}>
                  {/* Most Recent Occurrence */}
                  {selectedGroup.occurrences[0] && (
                    <Card sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, border: `1px solid ${THEME_PRO.border}` }}>
                      <Typography sx={{ fontWeight: 700, mb: SPACING_PRO.md }}>
                        Most Recent Occurrence
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING_PRO.lg, fontSize: '13px' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.xs }}>
                            Timestamp
                          </Typography>
                          <Typography sx={{ fontFamily: 'monospace', color: THEME_PRO.textPrimary }}>
                            {new Date(selectedGroup.occurrences[0].timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.xs }}>
                            Module
                          </Typography>
                          <Typography sx={{ fontFamily: 'monospace', color: THEME_PRO.textPrimary }}>
                            {selectedGroup.occurrences[0].module}
                          </Typography>
                        </Box>
                        {selectedGroup.occurrences[0].context?.requestId && (
                          <>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.xs }}>
                                Request ID
                              </Typography>
                              <Typography sx={{ fontFamily: 'monospace', color: THEME_PRO.textPrimary }}>
                                {selectedGroup.occurrences[0].context.requestId}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.xs }}>
                                User ID
                              </Typography>
                              <Typography sx={{ fontFamily: 'monospace', color: THEME_PRO.textPrimary }}>
                                {selectedGroup.occurrences[0].context.userId || 'N/A'}
                              </Typography>
                            </Box>
                          </>
                        )}
                        {selectedGroup.occurrences[0].context?.durationMs && (
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: THEME_PRO.textSecondary, mb: SPACING_PRO.xs }}>
                              Duration
                            </Typography>
                            <Typography sx={{ fontFamily: 'monospace', color: THEME_PRO.textPrimary }}>
                              {selectedGroup.occurrences[0].context.durationMs}ms
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  )}

                  {/* Error Context */}
                  {selectedGroup.occurrences[0]?.context && (
                    <Card sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, border: `1px solid ${THEME_PRO.border}` }}>
                      <Typography sx={{ fontWeight: 700, mb: SPACING_PRO.md }}>
                        Error Context
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: THEME_PRO.bgPrimary,
                          color: THEME_PRO.textSecondary,
                          p: SPACING_PRO.lg,
                          borderRadius: RADIUS_PRO.md,
                          border: `1px solid ${THEME_PRO.border}`,
                          overflow: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {JSON.stringify(selectedGroup.occurrences[0].context, null, 2)}
                      </Box>
                    </Card>
                  )}

                  {/* Stack Trace */}
                  {selectedGroup.occurrences[0]?.stackTrace && (
                    <Card sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, border: `1px solid ${THEME_PRO.border}` }}>
                      <Typography sx={{ fontWeight: 700, mb: SPACING_PRO.md }}>
                        Stack Trace
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: THEME_PRO.bgPrimary,
                          color: THEME_PRO.error,
                          p: SPACING_PRO.lg,
                          borderRadius: RADIUS_PRO.md,
                          border: `1px solid ${THEME_PRO.border}`,
                          overflow: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {selectedGroup.occurrences[0].stackTrace}
                      </Box>
                    </Card>
                  )}

                  {/* All Occurrences */}
                  <Card sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, border: `1px solid ${THEME_PRO.border}` }}>
                    <Typography sx={{ fontWeight: 700, mb: SPACING_PRO.md }}>
                      All Occurrences ({selectedGroup.occurrences.length})
                    </Typography>
                    <Stack spacing={SPACING_PRO.sm}>
                      {selectedGroup.occurrences.map((occ, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: SPACING_PRO.sm,
                            backgroundColor: THEME_PRO.bgPrimary,
                            borderRadius: RADIUS_PRO.sm,
                            border: `1px solid ${THEME_PRO.border}`,
                            fontSize: '12px',
                          }}
                        >
                          <Typography sx={{ fontFamily: 'monospace' }}>
                            {new Date(occ.timestamp).toLocaleString()} • {occ.module}
                            {occ.context?.requestId && ` • ${occ.context.requestId}`}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
    </LayoutPro>
  )
}
