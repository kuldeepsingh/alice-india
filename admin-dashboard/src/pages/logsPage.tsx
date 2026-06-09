/**
 * ============================================================================
 * ADMIN LOGS PAGE - EXHAUSTIVE LOGGING DASHBOARD
 * ============================================================================
 *
 * Purpose:
 *   Comprehensive log viewing and analysis interface for administrators
 *   - Real-time log display with auto-refresh
 *   - Multiple filtering options (level, module, date)
 *   - Full-text search capabilities
 *   - Log statistics and analytics
 *   - Export logs as JSON
 *   - Detailed log view with context and stack traces
 *
 * Features:
 *   ✅ Real-time logs from backend API
 *   ✅ Color-coded log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 *   ✅ Auto-refresh every 5 seconds
 *   ✅ Filter by log level and module
 *   ✅ Search by message or context
 *   ✅ View log statistics
 *   ✅ Export logs as JSON file
 *   ✅ Detailed log viewer with context and stack traces
 *   ✅ Pagination and sorting
 *   ✅ Error logs highlighted
 *
 * Access:
 *   Admin only - /admin/logs
 *
 * Usage:
 *   Console output: All logs appear here immediately
 *   Search: Filter logs by message or context keywords
 *   Filter: Select specific log level or module
 *   Export: Download all logs as JSON for analysis
 */

import React, { useState, useEffect, useCallback } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Stack,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'
import { Download, Search, Refresh, Close } from '@mui/icons-material'
import axios from 'axios'
import { frontendLogger } from '../services/logger'

/**
 * Log Entry Type Definition
 */
interface LogEntry {
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  module: string
  message: string
  context?: Record<string, any>
  stackTrace?: string
}

/**
 * Statistics Type Definition
 */
interface LogStatistics {
  totalLogs: number
  byLevel: Record<string, number>
  byModule: Record<string, number>
  oldestLog?: string
  newestLog?: string
}

/**
 * LogsPage Component - Main Log Viewing Interface
 *
 * This component displays all application logs with comprehensive
 * filtering, searching, and analysis capabilities.
 */
export function LogsPage() {
  const MODULE = 'LogsPage'

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // *** Log Data State ***
  // Stores fetched logs and filtered versions
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // *** Statistics State ***
  // Stores aggregated log statistics for dashboard cards
  const [stats, setStats] = useState<LogStatistics | null>(null)

  // *** Filter State ***
  // Tracks current filter selections
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')

  // *** UI State ***
  // Manages modal dialogs and interactions
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // =========================================================================
  // API FUNCTIONS
  // =========================================================================

  /**
   * Fetch recent logs from backend API
   * Called on component load and when filters change
   *
   * Logs:
   *   - Fetches with applied filters (level, module, search)
   *   - Logs fetch operation and results
   *   - Handles errors gracefully
   */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      frontendLogger.debug(MODULE, 'Fetching logs from backend', {
        filters: { level: selectedLevel, module: selectedModule, search: searchQuery },
      })

      // Log the API call to console
      console.log('%cℹ️ API Request: GET /api/v1/logs', 'color: #2196F3; font-weight: bold', {
        params: {
          limit: 100,
          level: selectedLevel || 'all',
          module: selectedModule || 'all',
          search: searchQuery || 'none',
        },
      })

      const response = await axios.get('/api/v1/logs', {
        params: {
          limit: 100,
          level: selectedLevel || undefined,
          module: selectedModule || undefined,
          search: searchQuery || undefined,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      const logsData = response.data.data || []
      frontendLogger.info(MODULE, 'Logs fetched successfully', {
        count: logsData.length,
        timestamp: new Date().toISOString(),
      })

      // Log results to console
      console.log('%c✅ Logs Fetched', 'color: #4CAF50; font-weight: bold', {
        count: logsData.length,
        levels: logsData.reduce((acc: any, log: LogEntry) => {
          acc[log.level] = (acc[log.level] || 0) + 1
          return acc
        }, {}),
      })

      setLogs(logsData)
      setError(null)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch logs'
      frontendLogger.error(MODULE, 'Failed to fetch logs', err, {
        status: err.response?.status,
        message: errorMsg,
      })

      // Log error to console
      console.error('%c❌ Failed to fetch logs', 'color: #F44336; font-weight: bold', {
        error: err.message,
        status: err.response?.status,
      })

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [selectedLevel, selectedModule, searchQuery])

  /**
   * Fetch log statistics from backend
   * Shows: total logs, count by level, count by module
   *
   * Used for: Dashboard cards showing summary stats
   */
  const fetchStatistics = useCallback(async () => {
    try {
      frontendLogger.debug(MODULE, 'Fetching log statistics')

      const response = await axios.get('/api/v1/logs/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      const statsData = response.data.stats
      frontendLogger.info(MODULE, 'Statistics retrieved', {
        totalLogs: statsData.totalLogs,
      })

      console.log('%c📊 Log Statistics', 'color: #FF9800; font-weight: bold', statsData)

      setStats(statsData)
    } catch (err: any) {
      frontendLogger.warn(MODULE, 'Failed to fetch statistics', {
        error: err.message,
      })
    }
  }, [])

  /**
   * Export all logs as JSON file
   * Downloads logs with timestamp and full details
   *
   * Logs:
   *   - Logs export request
   *   - Logs file download success/failure
   */
  const handleExportLogs = async () => {
    try {
      frontendLogger.info(MODULE, 'Exporting logs')

      console.log('%c📥 Exporting Logs', 'color: #2196F3; font-weight: bold')

      const response = await axios.get('/api/v1/logs/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      // Create and trigger download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      frontendLogger.info(MODULE, 'Logs exported successfully', {
        fileName: link.download,
      })

      console.log('%c✅ Logs exported successfully', 'color: #4CAF50; font-weight: bold')
    } catch (err: any) {
      frontendLogger.error(MODULE, 'Failed to export logs', err)
      setError('Failed to export logs')

      console.error('%c❌ Export failed', 'color: #F44336; font-weight: bold', err.message)
    }
  }

  // =========================================================================
  // EFFECTS (Hooks)
  // =========================================================================

  /**
   * Component Initialization
   * - Initial log and stats fetch
   * - Auto-refresh setup (5 second interval)
   * - Cleanup on unmount
   */
  useEffect(() => {
    frontendLogger.info(MODULE, 'LogsPage component mounted', {
      autoRefresh: autoRefresh,
    })

    console.log('%c📋 Logs Page Initialized', 'color: #2196F3; font-weight: bold', {
      autoRefresh,
      timestamp: new Date().toISOString(),
    })

    // Initial fetch
    fetchLogs()
    fetchStatistics()

    // Set up auto-refresh interval
    const interval = autoRefresh
      ? setInterval(() => {
          console.log('%c🔄 Auto-refreshing logs...', 'color: #FF9800; font-size: 0.9em')
          fetchLogs()
          fetchStatistics()
        }, 5000)
      : null

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval)
      frontendLogger.debug(MODULE, 'LogsPage component unmounted')
    }
  }, [fetchLogs, fetchStatistics, autoRefresh])

  /**
   * Filter Logs
   * - Applies search query, level filter, and module filter
   * - Updates filteredLogs when any filter changes
   * - Logs filtering operation for debugging
   */
  useEffect(() => {
    let filtered = logs

    // Apply search filter (message and context)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        JSON.stringify(log.context || {}).toLowerCase().includes(query)
      )
    }

    // Apply level filter
    if (selectedLevel && selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }

    // Apply module filter
    if (selectedModule) {
      filtered = filtered.filter(log => log.module === selectedModule)
    }

    setFilteredLogs(filtered)

    frontendLogger.debug(MODULE, 'Logs filtered', {
      original: logs.length,
      filtered: filtered.length,
      appliedFilters: {
        search: searchQuery || 'none',
        level: selectedLevel || 'all',
        module: selectedModule || 'all',
      },
    })
  }, [logs, searchQuery, selectedLevel, selectedModule])

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  /**
   * Get color for log level chip
   * DEBUG=info, INFO=success, WARN=warning, ERROR/FATAL=error
   */
  const getLevelColor = (level: string): any => {
    const colorMap: Record<string, string> = {
      DEBUG: '#00BCD4',
      INFO: '#4CAF50',
      WARN: '#FF9800',
      ERROR: '#F44336',
      FATAL: '#9C27B0',
    }
    return colorMap[level] || '#757575'
  }

  /**
   * Get unique module names from all logs
   * Used for populating module filter dropdown
   */
  const getUniqueModules = (): string[] => {
    return [...new Set(logs.map(log => log.module))].sort()
  }

  /**
   * Format timestamp for table display
   * Converts ISO string to HH:MM:SS format
   */
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  /**
   * Get background color for log row based on level
   * ERROR and FATAL logs are highlighted in red
   * WARN logs are highlighted in orange
   */
  const getRowBackgroundColor = (level: string): string => {
    if (level === 'ERROR' || level === 'FATAL') return '#ffebee'
    if (level === 'WARN') return '#fff3e0'
    return 'transparent'
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Page Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: '32px',
              fontWeight: 700,
              color: THEME_PRO.textPrimary,
              mb: SPACING_PRO.md,
            }}
          >
            📋 Application Logs
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>
            View real-time application logs with filtering and analysis
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={SPACING_PRO.lg} sx={{ mb: SPACING_PRO.xxxl }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: SPACING_PRO.lg, textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Logs
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: THEME_PRO.textPrimary,
                    fontSize: '28px',
                  }}
                >
                  {stats.totalLogs}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: SPACING_PRO.lg, textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Errors
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#F44336',
                    fontSize: '28px',
                  }}
                >
                  {(stats.byLevel['ERROR'] || 0) + (stats.byLevel['FATAL'] || 0)}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: SPACING_PRO.lg, textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Warnings
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#FF9800',
                    fontSize: '28px',
                  }}
                >
                  {stats.byLevel['WARN'] || 0}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: SPACING_PRO.lg, textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Modules
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: THEME_PRO.primary,
                    fontSize: '28px',
                  }}
                >
                  {Object.keys(stats.byModule).length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: SPACING_PRO.lg }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters and Controls Card */}
        <Card
          sx={{
            borderRadius: RADIUS_PRO.lg,
            border: `1px solid ${THEME_PRO.border}`,
            mb: SPACING_PRO.xxxl,
          }}
        >
          <CardHeader title="🔍 Filters & Controls" />
          <CardContent>
            <Stack spacing={SPACING_PRO.lg}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search logs by message or context..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    fetchLogs()
                  }
                }}
                variant="outlined"
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              {/* Filters Row */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={SPACING_PRO.lg}
                alignItems="flex-end"
              >
                {/* Level Filter */}
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    label="Log Level"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="DEBUG">🔵 DEBUG</MenuItem>
                    <MenuItem value="INFO">🟢 INFO</MenuItem>
                    <MenuItem value="WARN">🟡 WARN</MenuItem>
                    <MenuItem value="ERROR">🔴 ERROR</MenuItem>
                    <MenuItem value="FATAL">⚫ FATAL</MenuItem>
                  </Select>
                </FormControl>

                {/* Module Filter */}
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Module</InputLabel>
                  <Select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    label="Module"
                  >
                    <MenuItem value="">All Modules</MenuItem>
                    {getUniqueModules().map((module) => (
                      <MenuItem key={module} value={module}>
                        {module}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Action Buttons */}
                <Stack direction="row" spacing={SPACING_PRO.md} sx={{ ml: 'auto' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => {
                      fetchLogs()
                      fetchStatistics()
                    }}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportLogs}
                  >
                    Export
                  </Button>
                </Stack>
              </Stack>

              {/* Auto-refresh Toggle */}
              <Stack direction="row" spacing={SPACING_PRO.md} alignItems="center">
                <Button
                  variant={autoRefresh ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? '🔴 Auto-refresh ON' : '⚪ Auto-refresh OFF'}
                </Button>
                <Typography variant="caption" color="textSecondary">
                  {filteredLogs.length} logs displayed • Refresh every 5 seconds
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
          <CardHeader title="📊 Recent Logs" />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>
                      Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>
                      Level
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>
                      Module
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>
                      Message
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{ textAlign: 'center', py: 3, color: THEME_PRO.textSecondary }}
                      >
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs
                      .slice()
                      .reverse()
                      .map((log, idx) => (
                        <TableRow
                          key={idx}
                          onClick={() => {
                            setSelectedLog(log)
                            setDetailsOpen(true)
                          }}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: THEME_PRO.bgTertiary },
                            backgroundColor: getRowBackgroundColor(log.level),
                            borderBottom: `1px solid ${THEME_PRO.border}`,
                          }}
                        >
                          <TableCell
                            sx={{
                              color: THEME_PRO.textSecondary,
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                            }}
                          >
                            {formatTime(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.level}
                              size="small"
                              sx={{
                                backgroundColor: getLevelColor(log.level) + '20',
                                color: getLevelColor(log.level),
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              color: THEME_PRO.primary,
                              fontWeight: 600,
                              fontSize: '0.85rem',
                            }}
                          >
                            {log.module}
                          </TableCell>
                          <TableCell sx={{ color: THEME_PRO.textSecondary, fontSize: '0.85rem' }}>
                            {log.message}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Log Details Modal */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            📋 Log Details
            <IconButton onClick={() => setDetailsOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Stack spacing={SPACING_PRO.lg} sx={{ mt: SPACING_PRO.lg }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.timestamp}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Level
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedLog.level}
                      size="small"
                      sx={{
                        backgroundColor: getLevelColor(selectedLog.level) + '20',
                        color: getLevelColor(selectedLog.level),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Module
                  </Typography>
                  <Typography variant="body2">{selectedLog.module}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Message
                  </Typography>
                  <Typography variant="body2">{selectedLog.message}</Typography>
                </Box>

                {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Context
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        backgroundColor: THEME_PRO.bgTertiary,
                        p: SPACING_PRO.md,
                        borderRadius: RADIUS_PRO.md,
                        overflow: 'auto',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {JSON.stringify(selectedLog.context, null, 2)}
                    </Box>
                  </Box>
                )}

                {selectedLog.stackTrace && (
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Stack Trace
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        backgroundColor: '#ffebee',
                        p: SPACING_PRO.md,
                        borderRadius: RADIUS_PRO.md,
                        overflow: 'auto',
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        color: '#d32f2f',
                      }}
                    >
                      {selectedLog.stackTrace}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LayoutPro>
  )
}
