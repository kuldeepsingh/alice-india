import React, { useState } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { Add, Edit, Delete, Search } from '@mui/icons-material'
import { frontendLogger } from '../services/logging-client'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO } from '../theme-pro'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
  joinDate: string
}

const mockUsers: User[] = [
  { id: 1, name: 'Raj Kumar', email: 'raj@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Priya Singh', email: 'priya@example.com', role: 'Trader', status: 'Active', joinDate: '2024-02-20' },
  { id: 3, name: 'Amit Patel', email: 'amit@example.com', role: 'Analyst', status: 'Active', joinDate: '2024-03-10' },
  { id: 4, name: 'Neha Gupta', email: 'neha@example.com', role: 'Trader', status: 'Inactive', joinDate: '2024-01-25' },
  { id: 5, name: 'Vikram Reddy', email: 'vikram@example.com', role: 'Analyst', status: 'Active', joinDate: '2024-04-05' },
]

const AVAILABLE_ROLES = [
  { value: 'Admin', label: '👨‍💼 Admin - Full system access' },
  { value: 'Trader', label: '📈 Trader - Can place orders and manage positions' },
  { value: 'Analyst', label: '📊 Analyst - View-only access to analytics' },
  { value: 'Viewer', label: '👁️ Viewer - Read-only access' },
]

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Trader' })

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

  const handleDeleteUser = (id: number) => {
    const deletedUser = users.find(u => u.id === id)
    frontendLogger.info('Users', 'User deleted', {
      userId: id,
      userName: deletedUser?.name,
      email: deletedUser?.email,
    })
    setUsers(users.filter(u => u.id !== id))
  }

  const handleEditUser = (user: User) => {
    frontendLogger.debug('Users', 'Edit user dialog opened', {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setFormData({ name: user.name, email: user.email, role: user.role })
    setEditingUser(user)
    setOpenDialog(true)
  }

  const handleSaveUser = () => {
    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      frontendLogger.error('Users', 'Form validation failed', new Error('Missing fields'), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
      alert('Please fill all fields')
      return
    }

    if (!formData.email.includes('@')) {
      frontendLogger.error('Users', 'Invalid email format', new Error('Invalid email'), {
        email: formData.email,
      })
      alert('Please enter a valid email')
      return
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u))
      frontendLogger.info('Users', 'User updated', {
        userId: editingUser.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
    } else {
      // Add new user
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
      }
      setUsers([...users, newUser])
      frontendLogger.info('Users', 'User created', {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      })
    }

    setOpenDialog(false)
    setFormData({ name: '', email: '', role: 'Trader' })
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({ name: '', email: '', role: 'Trader' })
    setEditingUser(null)
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'Admin': THEME_PRO.primary,
      'Trader': THEME_PRO.secondary,
      'Analyst': THEME_PRO.warning,
    }
    return colors[role] || THEME_PRO.textSecondary
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
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={handleAddUser}
            sx={{
              backgroundColor: THEME_PRO.primary,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add User
          </Button>
        </Box>

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
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>Join Date</TableCell>
                  <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: THEME_PRO.bgTertiary }, borderBottom: `1px solid ${THEME_PRO.border}` }}>
                    <TableCell sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} sx={{ backgroundColor: getRoleColor(user.role), color: '#fff', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        sx={{
                          backgroundColor: user.status === 'Active' ? THEME_PRO.successLight : THEME_PRO.errorLight,
                          color: getStatusColor(user.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: THEME_PRO.textSecondary }}>{user.joinDate}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<Edit />} onClick={() => handleEditUser(user)} sx={{ color: THEME_PRO.primary, mr: SPACING_PRO.sm }}>
                        Edit
                      </Button>
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

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: RADIUS_PRO.lg,
                backgroundColor: THEME_PRO.bgSecondary,
                border: `1px solid ${THEME_PRO.border}`,
              },
            },
          }}
        >
          <DialogTitle sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>
            {editingUser ? '✏️ Edit User' : '➕ Add New User'}
          </DialogTitle>
          <DialogContent sx={{ pt: SPACING_PRO.lg, display: 'flex', flexDirection: 'column', gap: SPACING_PRO.lg }}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              variant="outlined"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME_PRO.bgTertiary,
                  '& fieldset': { borderColor: THEME_PRO.border },
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                sx={{
                  backgroundColor: THEME_PRO.bgTertiary,
                  color: THEME_PRO.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: THEME_PRO.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: THEME_PRO.primary,
                  },
                  '& .MuiSvgIcon-root': {
                    color: THEME_PRO.textSecondary,
                  },
                }}
              >
                {AVAILABLE_ROLES.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 600 }}>{role.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: THEME_PRO.textTertiary, mb: SPACING_PRO.sm, textTransform: 'uppercase' }}>
                📋 Role Descriptions
              </Typography>
              <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, lineHeight: 1.6 }}>
                {AVAILABLE_ROLES.find(r => r.value === formData.role)?.label}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: SPACING_PRO.lg, gap: SPACING_PRO.sm }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: THEME_PRO.textSecondary, textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              variant="contained"
              sx={{
                backgroundColor: THEME_PRO.primary,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutPro>
  )
}
