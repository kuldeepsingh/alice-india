import React, { useState } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Add, Edit, Delete, Search } from '@mui/icons-material'
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

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id))
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setOpenDialog(true)
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
            onClick={() => { setEditingUser(null); setOpenDialog(true); }}
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
            startAdornment={<Search sx={{ mr: SPACING_PRO.sm, color: THEME_PRO.textSecondary }} />}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME_PRO.bgTertiary,
                '& fieldset': { borderColor: THEME_PRO.border },
              },
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
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent sx={{ pt: SPACING_PRO.lg }}>
            <TextField fullWidth label="Name" margin="normal" variant="outlined" />
            <TextField fullWidth label="Email" margin="normal" variant="outlined" type="email" />
            <TextField fullWidth label="Role" margin="normal" variant="outlined" />
          </DialogContent>
          <DialogActions sx={{ p: SPACING_PRO.lg, gap: SPACING_PRO.sm }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" sx={{ backgroundColor: THEME_PRO.primary, color: '#fff' }}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutPro>
  )
}
