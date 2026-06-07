/**
 * Audit Trail Page
 * Immutable compliance audit logging
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
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material'

interface AuditLog {
  id: string
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress?: string
  status: 'success' | 'failure'
  createdAt: string
}

interface AuditResponse {
  status: string
  data: AuditLog[]
  pagination: {
    total: number
    page: number
    pageSize: number
    pages: number
  }
}

const ActionColors: Record<string, string> = {
  login: '#4CAF50',
  logout: '#9E9E9E',
  user_created: '#2196F3',
  user_updated: '#2196F3',
  user_deleted: '#F44336',
  permission_changed: '#FF9800',
  order_created: '#4CAF50',
  order_updated: '#2196F3',
  order_deleted: '#F44336',
  debug_enabled: '#FF6F00',
  debug_disabled: '#9E9E9E',
  password_changed: '#FF9800',
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)

  // Filters
  const [userId, setUserId] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [resourceType, setResourceType] = useState<string>('')

  // Fetch audit logs
  const fetchAuditLogs = async (pageNum: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (action) params.append('action', action)
      if (status) params.append('status', status)
      if (resourceType) params.append('resourceType', resourceType)
      params.append('limit', '50')
      params.append('offset', String((pageNum - 1) * 50))

      const response = await fetch(`/api/v1/audit?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const data: AuditResponse = await response.json()
      setLogs(data.data)
      setTotalPages(data.pagination.pages)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      alert('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs(1)
  }, [userId, action, status, resourceType])

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      if (userId) params.append('userId', userId)
      if (action) params.append('action', action)

      const response = await fetch(`/api/v1/audit/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to export logs')

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting logs:', error)
      alert('Failed to export logs')
    }
  }

  const handleReset = () => {
    setUserId('')
    setAction('')
    setStatus('')
    setResourceType('')
    setPage(1)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#C9A961' }}>
        📋 Audit Trail (Immutable)
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a', borderColor: '#C9A961', border: '1px solid' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <TextField
              label="User ID"
              variant="outlined"
              size="small"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ minWidth: 150 }}
            />

            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="user_created">User Created</MenuItem>
              <MenuItem value="user_updated">User Updated</MenuItem>
              <MenuItem value="user_deleted">User Deleted</MenuItem>
              <MenuItem value="permission_changed">Permission Changed</MenuItem>
              <MenuItem value="debug_enabled">Debug Enabled</MenuItem>
              <MenuItem value="debug_disabled">Debug Disabled</MenuItem>
              <MenuItem value="password_changed">Password Changed</MenuItem>
            </Select>

            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failure">Failure</MenuItem>
            </Select>

            <TextField
              label="Resource Type"
              variant="outlined"
              size="small"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              sx={{ minWidth: 150 }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchAuditLogs(1)}
              sx={{ backgroundColor: '#C9A961', color: '#000' }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              sx={{ borderColor: '#C9A961', color: '#C9A961' }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
              sx={{ borderColor: '#C9A961', color: '#C9A961' }}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ borderColor: '#C9A961', color: '#C9A961' }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Audit Logs Table */}
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
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Action</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Resource</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>IP Address</TableCell>
                  <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography sx={{ color: '#999' }}>No audit logs found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}
                    >
                      <TableCell sx={{ color: '#fff', fontSize: '0.85rem' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: '#999', fontSize: '0.85rem' }}>
                        {log.userId.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          sx={{
                            backgroundColor: ActionColors[log.action] || '#666',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#999' }}>
                        {log.resourceType ? `${log.resourceType} ${log.resourceId?.substring(0, 8) || ''}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          sx={{
                            backgroundColor: log.status === 'success' ? '#4CAF50' : '#F44336',
                            color: '#fff',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#999', fontSize: '0.85rem' }}>
                        {log.ipAddress || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedLog(log)
                            setOpenDetailDialog(true)
                          }}
                          sx={{ color: '#C9A961' }}
                        >
                          View
                        </Button>
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
                  onChange={(_, newPage) => fetchAuditLogs(newPage)}
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

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1a1a1a' } }}
      >
        <DialogTitle sx={{ color: '#C9A961', borderBottom: '1px solid #C9A961' }}>
          Audit Log Details
        </DialogTitle>
        <DialogContent sx={{ color: '#fff' }}>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                Action
              </Typography>
              <Typography sx={{ mb: 2 }}>{selectedLog.action}</Typography>

              {selectedLog.oldValue && (
                <>
                  <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                    Old Value
                  </Typography>
                  <Typography
                    component="pre"
                    sx={{
                      mb: 2,
                      backgroundColor: '#2a2a2a',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                    }}
                  >
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </Typography>
                </>
              )}

              {selectedLog.newValue && (
                <>
                  <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                    New Value
                  </Typography>
                  <Typography
                    component="pre"
                    sx={{
                      mb: 2,
                      backgroundColor: '#2a2a2a',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                    }}
                  >
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                IP Address
              </Typography>
              <Typography sx={{ mb: 2 }}>{selectedLog.ipAddress || 'N/A'}</Typography>

              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                Timestamp
              </Typography>
              <Typography>{new Date(selectedLog.createdAt).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #C9A961' }}>
          <Button onClick={() => setOpenDetailDialog(false)} sx={{ color: '#C9A961' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
