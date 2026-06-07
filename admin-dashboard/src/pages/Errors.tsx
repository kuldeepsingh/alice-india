/**
 * Errors Dashboard Page
 * Error tracking, grouping, and management
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Edit as EditIcon, Info as InfoIcon } from '@mui/icons-material'

interface Error {
  id: string
  title: string
  message: string
  occurrenceCount: number
  affectedUsers: number
  status: 'new' | 'investigating' | 'resolved'
  assignedTo?: string
  firstOccurrence: string
  lastOccurrence: string
  context?: Record<string, any>
  assignedToUser?: {
    id: string
    email: string
    role: string
  }
}

interface ErrorsResponse {
  status: string
  data: Error[]
  stats: {
    total: number
    errorRate: string
    topErrors: Error[]
  }
  pagination: {
    total: number
    page: number
    pageSize: number
  }
}

const StatusColors: Record<string, string> = {
  new: '#FF9800',
  investigating: '#2196F3',
  resolved: '#4CAF50',
}

export default function Errors() {
  const [errors, setErrors] = useState<Error[]>([])
  const [topErrors, setTopErrors] = useState<Error[]>([])
  const [errorRate, setErrorRate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedError, setSelectedError] = useState<Error | null>(null)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  // Edit form
  const [editStatus, setEditStatus] = useState<string>('')
  const [editAssignedTo, setEditAssignedTo] = useState<string>('')

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Fetch errors
  const fetchErrors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('sortBy', 'occurrence')
      params.append('limit', '50')

      const response = await fetch(`/api/v1/errors?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch errors')

      const data: ErrorsResponse = await response.json()
      setErrors(data.data)
      setTopErrors(data.stats.topErrors)
      setErrorRate(data.stats.errorRate)
    } catch (error) {
      console.error('Error fetching errors:', error)
      alert('Failed to fetch errors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchErrors()
  }, [statusFilter])

  const handleOpenDetail = (error: Error) => {
    setSelectedError(error)
    setOpenDetailDialog(true)
  }

  const handleOpenEdit = (error: Error) => {
    setSelectedError(error)
    setEditStatus(error.status)
    setEditAssignedTo(error.assignedTo || '')
    setOpenEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedError) return

    try {
      const response = await fetch(`/api/v1/errors/${selectedError.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: editStatus,
          assignedTo: editAssignedTo || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update error')

      setOpenEditDialog(false)
      fetchErrors()
      alert('Error updated successfully')
    } catch (error) {
      console.error('Error updating error:', error)
      alert('Failed to update error')
    }
  }

  // Prepare chart data
  const chartData = topErrors.slice(0, 5).map((error) => ({
    name: error.title.substring(0, 20),
    count: error.occurrenceCount,
    users: error.affectedUsers,
  }))

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#C9A961' }}>
        🚨 Error Tracking & Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #C9A961' }}>
            <CardContent>
              <Typography color="textSecondary" sx={{ color: '#999' }}>
                Total Errors
              </Typography>
              <Typography variant="h5" sx={{ color: '#C9A961' }}>
                {errors.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Typography color="textSecondary" sx={{ color: '#999' }}>
                Error Rate
              </Typography>
              <Typography variant="h5" sx={{ color: '#FF9800' }}>
                {errorRate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #EF5350' }}>
            <CardContent>
              <Typography color="textSecondary" sx={{ color: '#999' }}>
                New Errors
              </Typography>
              <Typography variant="h5" sx={{ color: '#EF5350' }}>
                {errors.filter((e) => e.status === 'new').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #4CAF50' }}>
            <CardContent>
              <Typography color="textSecondary" sx={{ color: '#999' }}>
                Resolved
              </Typography>
              <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                {errors.filter((e) => e.status === 'resolved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Errors Chart */}
      {topErrors.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
            Top Errors
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #C9A961' }} />
              <Legend />
              <Bar dataKey="count" fill="#C9A961" name="Occurrences" />
              <Bar dataKey="users" fill="#FF9800" name="Affected Users" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a', borderColor: '#C9A961', border: '1px solid' }}>
        <Stack direction="row" spacing={2}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>

          <Button
            variant="contained"
            onClick={fetchErrors}
            sx={{ backgroundColor: '#C9A961', color: '#000' }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Errors Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a1a' }}>
        {loading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#C9A961' }} />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: '#2a2a2a' }}>
              <TableRow>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Count</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Users</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Last Seen</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Assigned To</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ color: '#999' }}>No errors found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error) => (
                  <TableRow key={error.id} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                    <TableCell sx={{ color: '#fff', maxWidth: 300 }}>
                      <Typography variant="body2">{error.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={error.status}
                        sx={{
                          backgroundColor: StatusColors[error.status],
                          color: '#000',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#C9A961' }}>{error.occurrenceCount}</TableCell>
                    <TableCell sx={{ color: '#FF9800' }}>{error.affectedUsers}</TableCell>
                    <TableCell sx={{ color: '#999' }}>
                      {new Date(error.lastOccurrence).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: '#999' }}>
                      {error.assignedToUser?.email.split('@')[0] || '-'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => handleOpenDetail(error)}
                          sx={{ color: '#C9A961' }}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEdit(error)}
                          sx={{ color: '#FF9800' }}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
          Error Details
        </DialogTitle>
        <DialogContent sx={{ color: '#fff' }}>
          {selectedError && (
            <Box sx={{ mt: 2, spacing: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                Title
              </Typography>
              <Typography sx={{ mb: 2 }}>{selectedError.title}</Typography>

              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                Message
              </Typography>
              <Typography sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {selectedError.message}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                First Occurred
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {new Date(selectedError.firstOccurrence).toLocaleString()}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                Last Occurred
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {new Date(selectedError.lastOccurrence).toLocaleString()}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: '#C9A961', mb: 1 }}>
                Impact
              </Typography>
              <Typography>
                {selectedError.occurrenceCount} occurrences affecting {selectedError.affectedUsers} users
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #C9A961' }}>
          <Button onClick={() => setOpenDetailDialog(false)} sx={{ color: '#C9A961' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1a1a1a' } }}
      >
        <DialogTitle sx={{ color: '#C9A961', borderBottom: '1px solid #C9A961' }}>
          Edit Error
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Select
            fullWidth
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>

          <TextField
            fullWidth
            label="Assign To (User ID)"
            value={editAssignedTo}
            onChange={(e) => setEditAssignedTo(e.target.value)}
            placeholder="Leave empty to unassign"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #C9A961' }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ color: '#999' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{ backgroundColor: '#C9A961', color: '#000' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
