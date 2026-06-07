/**
 * Debug Sessions Page
 * Manage per-user debug mode activation
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
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Alert,
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material'

interface DebugSession {
  id: string
  userId: string
  expiresAt: string
  reason?: string
  logLevel: string
  remainingMinutes: number
}

interface DebugStats {
  totalSessions: number
  activeSessions: number
  totalUsers: number
  averageDurationMinutes: number
  commonReasons: Record<string, number>
}

const DURATION_OPTIONS = [
  { label: '1 Hour', value: 60 },
  { label: '4 Hours', value: 240 },
  { label: '8 Hours', value: 480 },
  { label: '24 Hours', value: 1440 },
]

export default function DebugSessions() {
  const [sessions, setSessions] = useState<DebugSession[]>([])
  const [stats, setStats] = useState<DebugStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)

  // Create form
  const [userId, setUserId] = useState<string>('')
  const [duration, setDuration] = useState<number>(60)
  const [reason, setReason] = useState<string>('')
  const [creatingSession, setCreatingSession] = useState(false)

  // Fetch sessions and stats
  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/debug', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch sessions')

      const data = await response.json()
      setSessions(data.data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      alert('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/debug/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchSessions()
    fetchStats()
    const interval = setInterval(() => {
      fetchSessions()
      fetchStats()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleCreateSession = async () => {
    if (!userId || !duration) {
      alert('Please fill in all required fields')
      return
    }

    setCreatingSession(true)
    try {
      const response = await fetch('/api/v1/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId,
          duration,
          reason: reason || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create session')

      setOpenCreateDialog(false)
      setUserId('')
      setDuration(60)
      setReason('')
      fetchSessions()
      alert('Debug session created successfully')
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create debug session')
    } finally {
      setCreatingSession(false)
    }
  }

  const handleDisableSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to disable this debug session?')) return

    try {
      const response = await fetch(`/api/v1/debug/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to disable session')

      fetchSessions()
      alert('Debug session disabled')
    } catch (error) {
      console.error('Error disabling session:', error)
      alert('Failed to disable session')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#C9A961' }}>
        🐛 Debug Sessions
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #C9A961' }}>
              <CardContent>
                <Typography color="textSecondary" sx={{ color: '#999' }}>
                  Total Sessions
                </Typography>
                <Typography variant="h5" sx={{ color: '#C9A961' }}>
                  {stats.totalSessions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #FF6F00' }}>
              <CardContent>
                <Typography color="textSecondary" sx={{ color: '#999' }}>
                  Active Sessions
                </Typography>
                <Typography variant="h5" sx={{ color: '#FF6F00' }}>
                  {stats.activeSessions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #2196F3' }}>
              <CardContent>
                <Typography color="textSecondary" sx={{ color: '#999' }}>
                  Users with Debug
                </Typography>
                <Typography variant="h5" sx={{ color: '#2196F3' }}>
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #4CAF50' }}>
              <CardContent>
                <Typography color="textSecondary" sx={{ color: '#999' }}>
                  Avg Duration
                </Typography>
                <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                  {stats.averageDurationMinutes}m
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Common Reasons */}
      {stats && Object.keys(stats.commonReasons).length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
            Common Debug Reasons
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {Object.entries(stats.commonReasons).map(([reason, count]) => (
              <Chip
                key={reason}
                label={`${reason} (${count})`}
                sx={{ backgroundColor: '#2a2a2a', color: '#C9A961' }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Create Session Button */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ backgroundColor: '#C9A961', color: '#000' }}
          >
            Enable Debug for User
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchSessions()
              fetchStats()
            }}
            sx={{ borderColor: '#C9A961', color: '#C9A961' }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Active Sessions Table */}
      <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
        Active Debug Sessions
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a1a' }}>
        {loading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#C9A961' }} />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: '#2a2a2a' }}>
              <TableRow>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Log Level</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Expires At</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Remaining</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ color: '#999' }}>No active debug sessions</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                    <TableCell sx={{ color: '#fff', fontSize: '0.85rem' }}>
                      {session.userId.substring(0, 12)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.logLevel}
                        sx={{
                          backgroundColor: '#FF6F00',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#999', fontSize: '0.85rem' }}>
                      {new Date(session.expiresAt).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#C9A961', fontWeight: 'bold' }}>
                      {session.remainingMinutes > 0 ? (
                        <Chip
                          label={`${session.remainingMinutes}m`}
                          sx={{
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                          }}
                        />
                      ) : (
                        <Chip
                          label="Expired"
                          sx={{
                            backgroundColor: '#F44336',
                            color: '#fff',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#999' }}>{session.reason || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDisableSession(session.id)}
                        sx={{ color: '#F44336' }}
                      >
                        Disable
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Create Session Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1a1a1a' } }}
      >
        <DialogTitle sx={{ color: '#C9A961', borderBottom: '1px solid #C9A961' }}>
          Enable Debug Mode
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enable debug mode to capture DEBUG level logs for a specific user
          </Alert>

          <TextField
            fullWidth
            label="User ID (required)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User UUID"
            sx={{ mb: 2 }}
          />

          <Select
            fullWidth
            value={duration}
            onChange={(e) => setDuration(e.target.value as number)}
            sx={{ mb: 2 }}
          >
            {DURATION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Investigating issue #123"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #C9A961' }}>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: '#999' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            sx={{ backgroundColor: '#C9A961', color: '#000' }}
            disabled={creatingSession}
          >
            {creatingSession ? 'Creating...' : 'Enable Debug'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
