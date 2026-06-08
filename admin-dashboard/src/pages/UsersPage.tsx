import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material'
import { Add, Edit, Delete, Search } from '@mui/icons-material'
import { frontendLogger } from '../services/logging-client'
import { usersAPI } from '../services/api'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

interface User {
  id: string
  name?: string
  email: string
  role: string
  created_at: string
}

interface UserDisplay extends User {
  status: 'Active' | 'Inactive'
  joinDate: string
}

const AVAILABLE_ROLES = [
  { value: 'Admin', label: '👨‍💼 Admin - Full system access' },
  { value: 'Trader', label: '📈 Trader - Can place orders and manage positions' },
  { value: 'Analyst', label: '📊 Analyst - View-only access to analytics' },
  { value: 'Viewer', label: '👁️ Viewer - Read-only access' },
]

export function UsersPage() {
  const [users, setUsers] = useState<UserDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDisplay | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'trader' })

  // Load users from API on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await usersAPI.getAll()
      const apiUsers = response.data.data || []

      // Transform API users to display format
      const displayUsers: UserDisplay[] = apiUsers.map((user: User) => ({
        ...user,
        status: 'Active' as const,
        joinDate: new Date(user.created_at).toISOString().split('T')[0],
      }))

      setUsers(displayUsers)
      frontendLogger.info('Users', 'Users loaded from API', {
        count: displayUsers.length,
      })
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load users'
      setError(errorMsg)
      frontendLogger.error('Users', 'Failed to load users', err, {
        error: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = () => {
    frontendLogger.debug('Users', 'Add user dialog opened')
    setFormData({ name: '', email: '', role: 'Trader' })
    setEditingUser(null)
    setOpenDialog(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const deletedUser = users.find(u => u.id === id)
      await usersAPI.delete(id)

      frontendLogger.info('Users', 'User deleted', {
        userId: id,
        email: deletedUser?.email,
      })

      setUsers(users.filter(u => u.id !== id))
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete user'
      setError(errorMsg)
      frontendLogger.error('Users', 'Failed to delete user', err, {
        userId: id,
        error: errorMsg,
      })
    }
  }

  const handleEditUser = (user: UserDisplay) => {
    frontendLogger.debug('Users', 'Edit user dialog opened', {
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    setFormData({ name: user.name || '', email: user.email, role: user.role })
    setEditingUser(user)
    setOpenDialog(true)
  }

  const handleSaveUser = () => {
    // Validation
    if (!formData.email || !formData.role) {
      frontendLogger.error('Users', 'Form validation failed', new Error('Missing fields'), {
        email: formData.email,
        role: formData.role,
      })
      alert('Please fill all required fields')
      return
    }

    if (!formData.email.includes('@')) {
      frontendLogger.error('Users', 'Invalid email format', new Error('Invalid email'), {
        email: formData.email,
      })
      alert('Please enter a valid email')
      return
    }

    // For now, only support viewing and deleting users from the admin panel
    // Registration is done through the login page
    frontendLogger.info('Users', 'User management requires registration via login page')
    alert('Users can only be added through the registration page. Deletion is available above.')
    setOpenDialog(false)
    setFormData({ name: '', email: '', role: 'trader' })
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({ name: '', email: '', role: 'Trader' })
    setEditingUser(null)
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': THEME_PRO.primary,
      'trader': THEME_PRO.secondary,
      'analyst': THEME_PRO.warning,
      'viewer': '#6B7280',
    }
    return colors[role?.toLowerCase()] || THEME_PRO.textSecondary
  }

  const getStatusColor = (status: string) => {
    return status === 'Active' ? THEME_PRO.success : THEME_PRO.error
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
              👥 Users Management
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary }}>
              Manage user accounts and permissions ({users.length} users)
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: SPACING_PRO.lg }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>


        {/* Search Bar */}
        <Card sx={{ p: SPACING_PRO.lg, mb: SPACING_PRO.lg, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME_PRO.bgTertiary,
                '& fieldset': { borderColor: THEME_PRO.border },
              },
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: SPACING_PRO.sm, color: THEME_PRO.textSecondary }} />,
            }}
          />
        </Card>

        {/* Users Table */}
        <Card sx={{ borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, boxShadow: SHADOWS_PRO.md, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Join Date</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: THEME_PRO.bgTertiary }, borderBottom: `1px solid ${THEME_PRO.border}` }}>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} sx={{ backgroundColor: getRoleColor(user.role), color: '#fff', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{user.joinDate}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<Delete />} onClick={() => handleDeleteUser(user.id)} sx={{ color: THEME_PRO.error }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

          </>
        )}
      </Box>
    </LayoutPro>
  )
}
