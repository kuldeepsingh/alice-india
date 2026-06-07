/**
 * Logs Page
 * Professional log viewer with filtering and tracing
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Pagination,
  Stack,
  Chip,
  Typography,
} from '@mui/material'
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material'

interface Log {
  id: string
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  message: string
  userId?: string
  module?: string
  correlationId?: string
  context?: Record<string, any>
}

interface LogsResponse {
  status: string
  data: Log[]
  pagination: {
    total: number
    page: number
    pageSize: number
    pages: number
  }
}

const LogLevelColors: Record<string, string> = {
  DEBUG: '#90CAF9',
  INFO: '#A5D6A7',
  WARN: '#FFD54F',
  ERROR: '#EF5350',
  FATAL: '#C62828',
}

const LogLevelBgColors: Record<string, string> = {
  DEBUG: '#E3F2FD',
  INFO: '#E8F5E9',
  WARN: '#FFFDE7',
  ERROR: '#FFEBEE',
  FATAL: '#B71C1C',
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [logLevel, setLogLevel] = useState<string>('')
  const [module, setModule] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [correlationId, setCorrelationId] = useState<string>('')

  // Fetch logs
  const fetchLogs = async (pageNum: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (logLevel) params.append('level', logLevel)
      if (module) params.append('module', module)
      if (search) params.append('search', search)
      if (userId) params.append('userId', userId)
      if (correlationId) params.append('correlationId', correlationId)
      params.append('limit', '50')
      params.append('offset', String((pageNum - 1) * 50))

      const response = await fetch(`/api/v1/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch logs')

      const data: LogsResponse = await response.json()
      setLogs(data.data)
      setTotalPages(data.pagination.pages)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching logs:', error)
      alert('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [logLevel, module, search, userId, correlationId])

  const handleTraceClick = (cid: string) => {
    setCorrelationId(cid)
  }

  const handleReset = () => {
    setLogLevel('')
    setModule('')
    setSearch('')
    setUserId('')
    setCorrelationId('')
    setPage(1)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#C9A961' }}>
        📊 Application Logs
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a', borderColor: '#C9A961', border: '1px solid' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <TextField
              label="Search Message"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            />

            <Select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="DEBUG">Debug</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="WARN">Warning</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="FATAL">Fatal</MenuItem>
            </Select>

            <TextField
              label="Module"
              variant="outlined"
              size="small"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              sx={{ minWidth: 150 }}
            />

            <TextField
              label="User ID"
              variant="outlined"
              size="small"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ minWidth: 150 }}
            />
          </Stack>

          {correlationId && (
            <Box sx={{ p: 1, backgroundColor: '#C9A961', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: '#000' }}>
                Tracing Correlation ID: {correlationId}{' '}
                <Button
                  size="small"
                  onClick={() => setCorrelationId('')}
                  sx={{ ml: 1, color: '#000' }}
                >
                  Clear
                </Button>
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchLogs(1)}
              sx={{ backgroundColor: '#C9A961', color: '#000' }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ borderColor: '#C9A961', color: '#C9A961' }}
            >
              Reset Filters
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a1a' }}>
        {loading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#C9A961' }} />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ backgroundColor: '#2a2a2a' }}>
                <TableRow>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Timestamp</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Level</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Message</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Module</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Correlation ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography sx={{ color: '#999' }}>No logs found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      sx={{
                        backgroundColor: LogLevelBgColors[log.level],
                        '&:hover': { backgroundColor: '#2a2a2a' },
                      }}
                    >
                      <TableCell sx={{ color: '#fff', fontSize: '0.85rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.level}
                          sx={{
                            backgroundColor: LogLevelColors[log.level],
                            color: '#000',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff', maxWidth: 400 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {log.message}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#999' }}>{log.module || '-'}</TableCell>
                      <TableCell sx={{ color: '#999', fontSize: '0.85rem' }}>
                        {log.userId ? log.userId.substring(0, 8) : '-'}
                      </TableCell>
                      <TableCell>
                        {log.correlationId ? (
                          <Button
                            size="small"
                            onClick={() => handleTraceClick(log.correlationId!)}
                            sx={{ color: '#C9A961', textTransform: 'none' }}
                          >
                            Trace
                          </Button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {logs.length > 0 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', backgroundColor: '#2a2a2a' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => fetchLogs(newPage)}
                  sx={{
                    '& .MuiPaginationItem-root': { color: '#C9A961' },
                    '& .MuiPaginationItem-page.Mui-selected': {
                      backgroundColor: '#C9A961',
                      color: '#000',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </TableContainer>
    </Box>
  )
}
