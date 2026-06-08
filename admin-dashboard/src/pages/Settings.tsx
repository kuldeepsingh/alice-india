/**
 * Settings Page
 * User configuration including Zerodha API credentials
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const SettingsCard = styled(Paper)(({ theme }) => ({
  padding: '24px',
  marginBottom: '24px',
  borderLeft: '4px solid #D4AF37',
}))

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [hasCredentials, setHasCredentials] = useState(false)
  const [credentialStatus, setCredentialStatus] = useState<{
    status: string
    lastValidatedAt?: string
    validationError?: string
  } | null>(null)

  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      const response = await fetch('http://localhost:3000/api/v1/credentials/zerodha/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      if (!response.ok) throw new Error('Failed to fetch settings')

      const data = await response.json()

      if (data.data.hasCredentials) {
        setHasCredentials(true)
        setCredentialStatus(data.data)
      } else {
        setHasCredentials(false)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCredentials = async () => {
    try {
      if (!formData.apiKey || !formData.apiSecret) {
        setError('API key and secret are required')
        return
      }

      setSaving(true)

      const response = await fetch('http://localhost:3000/api/v1/credentials/zerodha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save credentials')
      }

      setSuccess('Credentials saved successfully! Please validate them.')
      setFormData({ apiKey: '', apiSecret: '' })
      setError(null)

      // Refresh status
      setTimeout(() => fetchSettings(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSuccess(null)
    } finally {
      setSaving(false)
    }
  }

  const handleValidateCredentials = async () => {
    try {
      setTesting(true)

      const response = await fetch('http://localhost:3000/api/v1/credentials/zerodha/validate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(
          `✅ Credentials validated! Connected as ${data.data.userName} (${data.data.broker})`
        )
        setError(null)
      } else {
        setError(`❌ Validation failed: ${data.error}`)
        setSuccess(null)
      }

      // Refresh status
      setTimeout(() => fetchSettings(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation error')
      setSuccess(null)
    } finally {
      setTesting(false)
    }
  }

  const handleDeleteCredentials = async () => {
    if (!window.confirm('Are you sure you want to delete your credentials?')) return

    try {
      const response = await fetch('http://localhost:3000/api/v1/credentials/zerodha', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete credentials')

      setSuccess('Credentials deleted successfully')
      setError(null)
      setHasCredentials(false)
      setCredentialStatus(null)
      setFormData({ apiKey: '', apiSecret: '' })

      fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        ⚙️ Settings
      </Typography>

      {/* Zerodha Credentials Section */}
      <SettingsCard>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          💹 Zerodha API Credentials
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Status Card */}
            {hasCredentials && credentialStatus && (
              <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Current Status
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={credentialStatus.status?.toUpperCase()}
                      color={credentialStatus.status === 'active' ? 'success' : 'warning'}
                      variant="outlined"
                    />

                    {credentialStatus.lastValidatedAt && (
                      <Chip
                        label={`Last validated: ${new Date(credentialStatus.lastValidatedAt).toLocaleDateString()}`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  {credentialStatus.validationError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {credentialStatus.validationError}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Input Form */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: '500', mb: 2 }}>
                {hasCredentials ? 'Update Credentials' : 'Add Zerodha Credentials'}
              </Typography>

              <TextField
                fullWidth
                label="Zerodha API Key"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Your Zerodha API key"
                sx={{ mb: 2 }}
                helperText="Your API key from Zerodha broker"
              />

              <TextField
                fullWidth
                label="Zerodha API Secret"
                type="password"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                placeholder="Your Zerodha API secret"
                sx={{ mb: 2 }}
                helperText="Your API secret (stored encrypted)"
              />

              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
                🔒 Your credentials are encrypted and stored securely. They will never be exposed
                in logs or the UI.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveCredentials}
                disabled={saving || !formData.apiKey || !formData.apiSecret}
              >
                {saving ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                {hasCredentials ? 'Update' : 'Save'} Credentials
              </Button>

              {hasCredentials && (
                <>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleValidateCredentials}
                    disabled={testing}
                  >
                    {testing ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                    Test Connection
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteCredentials}
                  >
                    Delete Credentials
                  </Button>
                </>
              )}
            </Box>

            {/* Security Info */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🔐 Security Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                ✓ Credentials are encrypted using AES-256-GCM  
                ✓ Each user has their own isolated credentials  
                ✓ Credentials are never logged or displayed  
                ✓ All credential operations are audited  
                ✓ You can update or delete credentials anytime  
              </Typography>
            </Box>
          </>
        )}
      </SettingsCard>

      {/* Additional Settings */}
      <SettingsCard>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          📋 Other Settings
        </Typography>

        <Typography variant="body2" sx={{ color: '#666' }}>
          More settings coming soon...
        </Typography>
      </SettingsCard>
    </Container>
  )
}
