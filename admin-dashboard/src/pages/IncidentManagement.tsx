/**
 * Incident Management Page
 * Professional incident tracking and management interface
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
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material'
import { styled } from '@mui/material/styles'

interface Incident {
  id: string
  title: string
  description?: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdBy: string
  assignedTo?: string
  resolutionNotes?: string
  createdAt: string
  updatedAt: string
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}))

const SeverityChip = styled(Chip)(({ severity }: { severity?: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: '#FF0000', text: '#fff' },
    high: { bg: '#FF9900', text: '#fff' },
    medium: { bg: '#FFFF00', text: '#000' },
    low: { bg: '#00FF00', text: '#000' },
  }
  const color = colors[severity || 'low']
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 'bold',
  }
})

const StatusChip = styled(Chip)(({ status }: { status?: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    open: { bg: '#FF6B6B', text: '#fff' },
    investigating: { bg: '#4ECDC4', text: '#fff' },
    resolved: { bg: '#95E1D3', text: '#000' },
    closed: { bg: '#C7CEEA', text: '#000' },
  }
  const color = colors[status || 'open']
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 'bold',
  }
})

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
  })
  const [assignData, setAssignData] = useState({
    assignedTo: '',
  })

  // Fetch incidents
  useEffect(() => {
    fetchIncidents()
  }, [page, statusFilter, severityFilter])

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '10',
        offset: String((page - 1) * 10),
      })
      if (statusFilter) params.append('status', statusFilter)
      if (severityFilter) params.append('severity', severityFilter)

      const response = await fetch(`http://localhost:3000/api/v1/incidents?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch incidents')
      const data = await response.json()

      setIncidents(data.data || [])
      setTotalPages(Math.ceil((data.pagination?.total || 0) / 10))
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create incident')

      setCreateDialogOpen(false)
      setFormData({ title: '', description: '', severity: 'medium' })
      fetchIncidents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAssignIncident = async () => {
    if (!selectedIncident || !assignData.assignedTo) return

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/incidents/${selectedIncident.id}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ assignedTo: assignData.assignedTo }),
        }
      )

      if (!response.ok) throw new Error('Failed to assign incident')

      setAssignDialogOpen(false)
      setAssignData({ assignedTo: '' })
      fetchIncidents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStatusChange = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/incidents/${incidentId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) throw new Error('Failed to update status')
      fetchIncidents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🚨 Incident Management
          </Typography>
          <Button
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Incident
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                label="Severity"
                onChange={(e) => {
                  setSeverityFilter(e.target.value)
                  setPage(1)
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id} hover>
                      <TableCell>{incident.title}</TableCell>
                      <TableCell>
                        <SeverityChip
                          severity={incident.severity}
                          label={incident.severity.toUpperCase()}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          status={incident.status}
                          label={incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{incident.assignedTo ? '✓ Assigned' : 'Unassigned'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedIncident(incident)
                            setDetailsDialogOpen(true)
                          }}
                          sx={{ mr: 1 }}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedIncident(incident)
                            setAssignDialogOpen(true)
                          }}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Box>
          </>
        )}
      </StyledPaper>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Incident</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Severity</InputLabel>
            <Select
              value={formData.severity}
              label="Severity"
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateIncident} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedIncident?.title}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedIncident && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Status</Typography>
                <StatusChip status={selectedIncident.status} label={selectedIncident.status} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Severity</Typography>
                <SeverityChip severity={selectedIncident.severity} label={selectedIncident.severity} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Description</Typography>
                <Typography variant="body2">{selectedIncident.description || 'No description'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Created</Typography>
                <Typography variant="body2">{new Date(selectedIncident.createdAt).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Incident</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Assign To (User ID)"
            value={assignData.assignedTo}
            onChange={(e) => setAssignData({ ...assignData, assignedTo: e.target.value })}
            margin="normal"
            placeholder="Enter user UUID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignIncident} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
