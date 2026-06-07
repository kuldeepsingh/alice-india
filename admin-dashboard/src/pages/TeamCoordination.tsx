/**
 * Team Coordination Page
 * On-call scheduling and team availability management
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { styled } from '@mui/material/styles'

interface OnCallSchedule {
  id: string
  user_id: string
  start_date: string
  end_date: string
  shift_type: string
  primary_oncall: boolean
  created_at: string
}

interface TeamMetrics {
  onCall: {
    users_on_call: number
    total_schedules: number
    primary_count: number
    backup_count: number
  }
  incidents: {
    open_count: number
    investigating_count: number
    resolved_count: number
    total_count: number
  }
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}))

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: theme.spacing(2),
}))

export default function TeamCoordination() {
  const [schedule, setSchedule] = useState<OnCallSchedule[]>([])
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    startDate: '',
    endDate: '',
    shiftType: 'daytime',
    notes: '',
  })

  // Fetch data
  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      setLoading(true)

      const scheduleRes = await fetch('http://localhost:3000/api/v1/team/on-call', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const metricsRes = await fetch('http://localhost:3000/api/v1/team/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!scheduleRes.ok || !metricsRes.ok) throw new Error('Failed to fetch team data')

      const scheduleData = await scheduleRes.json()
      const metricsData = await metricsRes.json()

      setSchedule(scheduleData.data?.schedule || [])
      setMetrics(metricsData.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchedule = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/team/on-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create schedule')

      setCreateDialogOpen(false)
      setFormData({
        userId: '',
        startDate: '',
        endDate: '',
        shiftType: 'daytime',
        notes: '',
      })
      fetchTeamData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const ShiftTypeChip = (shiftType: string) => {
    const colors: Record<string, string> = {
      daytime: '#4CAF50',
      night: '#2196F3',
      weekend: '#FF9800',
      'full-week': '#F44336',
    }
    return (
      <Chip
        label={shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}
        sx={{
          backgroundColor: colors[shiftType] || '#999',
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Statistics Cards */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                  Users On-Call
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {metrics.onCall.users_on_call}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                  Active Incidents
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {metrics.incidents.open_count + metrics.incidents.investigating_count}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                  Primary Shifts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {metrics.onCall.primary_count}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                  Total Schedules
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {metrics.onCall.total_schedules}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>
      )}

      {/* Main Section */}
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            📅 On-Call Schedule
          </Typography>
          <Button
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Schedule
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Shift Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.user_id.substring(0, 8)}...</TableCell>
                    <TableCell>{new Date(item.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(item.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{ShiftTypeChip(item.shift_type)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.primary_oncall ? 'Primary' : 'Backup'}
                        color={item.primary_oncall ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledPaper>

      {/* Create Schedule Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create On-Call Schedule</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="User ID (UUID)"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            margin="normal"
            placeholder="e.g., 550e8400-e29b-41d4-a716..."
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Shift Type</InputLabel>
            <Select
              value={formData.shiftType}
              label="Shift Type"
              onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
            >
              <MenuItem value="daytime">Daytime (9-5)</MenuItem>
              <MenuItem value="night">Night (5-9)</MenuItem>
              <MenuItem value="weekend">Weekend</MenuItem>
              <MenuItem value="full-week">Full Week (24/7)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSchedule} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
