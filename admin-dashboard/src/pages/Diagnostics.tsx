/**
 * Diagnostics Page
 * Run backend tests and display results
 */

import React, { useState } from 'react'
import {
  Container,
  Paper,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const PassCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  fontWeight: '500',
}))

const FailCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#ffebee',
  color: '#c62828',
  fontWeight: '500',
}))

const SkipCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#fff3e0',
  color: '#e65100',
  fontWeight: '500',
}))

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}))

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  message?: string
  error?: string
}

interface TestSuiteResult {
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  results: TestResult[]
}

export default function Diagnostics() {
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestSuiteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [console, setConsole] = useState<string[]>([])

  const runTests = async () => {
    try {
      setLoading(true)
      setError(null)
      setConsole(['Starting test suite...'])

      const response = await fetch('http://localhost:3000/api/v1/testing/run-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to run tests')
      }

      const data = await response.json()
      setTestResults(data.data)

      // Build console output
      const logs = [
        '═══════════════════════════════════════════',
        '          TEST SUITE RESULTS',
        '═══════════════════════════════════════════',
        `Total Tests: ${data.data.totalTests}`,
        `Passed: ${data.data.passed} ✅`,
        `Failed: ${data.data.failed} ❌`,
        `Skipped: ${data.data.skipped} ⏭️`,
        `Total Duration: ${data.data.duration}ms`,
        '',
        '───────────────────────────────────────────',
        'DETAILED RESULTS:',
        '───────────────────────────────────────────',
        ...data.data.results.map((r: TestResult) => {
          const status =
            r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️'
          return `${status} ${r.name} (${r.duration}ms)${r.message ? ': ' + r.message : ''}${r.error ? ' - ERROR: ' + r.error : ''}`
        }),
        '',
        '═══════════════════════════════════════════',
      ]

      setConsole(logs)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      setConsole(['❌ Test suite failed to run', `Error: ${errorMsg}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          🧪 Diagnostics & Testing
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={runTests}
          disabled={loading}
          sx={{ height: '40px' }}
        >
          {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : '▶'}
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {testResults && (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {testResults.totalTests}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Passed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {testResults.passed}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Failed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {testResults.failed}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {testResults.duration}ms
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Success Rate: {((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(testResults.passed / testResults.totalTests) * 100}
              sx={{ height: '8px', borderRadius: '4px' }}
            />
          </Paper>

          {/* Test Results Table */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                📋 Test Results
              </Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Test Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Duration
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testResults.results.map((result, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      {result.status === 'pass' ? (
                        <Chip label="PASS" color="success" size="small" />
                      ) : result.status === 'fail' ? (
                        <Chip label="FAIL" color="error" size="small" />
                      ) : (
                        <Chip label="SKIP" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: '500' }}>{result.name}</TableCell>
                    <TableCell align="right">{result.duration}ms</TableCell>
                    <TableCell sx={{ fontSize: '12px', color: '#666' }}>
                      {result.message && (
                        <Box sx={{ color: '#2e7d32' }}>✓ {result.message}</Box>
                      )}
                      {result.error && (
                        <Box sx={{ color: '#c62828' }}>✗ {result.error}</Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {/* Console Output */}
      <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4ec9b0' }}>
            📟 Console Output
          </Typography>
          <Button
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(console.join('\n'))
              alert('Copied to clipboard!')
            }}
          >
            Copy
          </Button>
        </Box>

        <Box
          sx={{
            backgroundColor: '#1e1e1e',
            p: 2,
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          {console.map((line, idx) => (
            <div key={idx} style={{ color: line.includes('✅') ? '#4ec9b0' : line.includes('❌') ? '#f48771' : line.includes('⏭️') ? '#dcdcaa' : '#d4d4d4' }}>
              {line}
            </div>
          ))}
        </Box>
      </Paper>

      {/* Instructions */}
      {!testResults && (
        <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f0f8ff' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            📖 How to Use
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', lineHeight: '1.8' }}>
            Click "Run All Tests" to execute the complete backend test suite. Tests include:
            <ul style={{ marginTop: '8px', marginBottom: '0' }}>
              <li>Database connection and table verification</li>
              <li>Credential encryption/decryption</li>
              <li>Cache service functionality</li>
              <li>Zerodha service initialization</li>
              <li>Zerodha API connection (if credentials configured)</li>
            </ul>
          </Typography>
        </Paper>
      )}
    </Container>
  )
}
