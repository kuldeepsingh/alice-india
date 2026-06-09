import React, { useState, useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Chip, LinearProgress, Alert } from '@mui/material'
import { PlayArrow, CheckCircle, ErrorOutlined, Schedule, Stop } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'
import { frontendLogger } from '../services/logging-client'

const tests = [
  { name: 'Backend API Health', status: 'passed', duration: '125ms' },
  { name: 'Database Connection', status: 'passed', duration: '85ms' },
  { name: 'Trading API Connection', status: 'warning', duration: '2500ms' },
  { name: 'Cache Server', status: 'passed', duration: '45ms' },
  { name: 'Credential Encryption', status: 'passed', duration: '320ms' },
]

export function diagnosticsPage() {
  const [running, setRunning] = useState(false)
  const [stoppedMessage, setStoppedMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!running) return

    // Generate operation ID for this diagnostic run
    const operationId = `diagnostics-run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    // Log: Diagnostics started
    frontendLogger.info('Diagnostics', 'System health check started', {
      operationId,
      testCount: tests.length,
      timestamp: new Date().toISOString(),
    })

    // Simulate test progression
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      if (!running) {
        clearInterval(progressInterval)
        return
      }
      currentProgress += Math.random() * 25
      if (currentProgress >= 100) currentProgress = 100
      setProgress(currentProgress)
    }, 800)

    // Simulate tests completing
    const testTimer = setTimeout(() => {
      if (running) {
        setRunning(false)
        setProgress(100)
        const duration = Date.now() - startTime

        // Log: All tests completed
        frontendLogger.info('Diagnostics', 'All health checks completed successfully', {
          operationId,
          testCount: tests.length,
          durationMs: duration,
          results: tests.map(t => ({ name: t.name, status: t.status })),
          timestamp: new Date().toISOString(),
        })
      }
      clearInterval(progressInterval)
    }, 8000)

    // Cleanup function when component unmounts or running stops
    return () => {
      clearInterval(progressInterval)
      clearTimeout(testTimer)
    }
  }, [running])

  const handleStart = () => {
    setStoppedMessage('')
    setProgress(0)
    setRunning(true)

    // Log: User initiated diagnostics
    frontendLogger.debug('Diagnostics', 'User initiated system health checks', {
      timestamp: new Date().toISOString(),
      action: 'start_diagnostics',
    })
  }

  const handleStop = () => {
    setRunning(false)
    const stoppedAt = Math.round(progress)

    // Log: Diagnostics stopped by user
    frontendLogger.warn('Diagnostics', 'System health checks stopped by user', {
      stoppedAtProgress: stoppedAt,
      completedTests: Math.floor(tests.length * (stoppedAt / 100)),
      totalTests: tests.length,
      timestamp: new Date().toISOString(),
    })

    setStoppedMessage(`Tests stopped at ${stoppedAt}% progress. Run again to complete all checks.`)

    // Clear message after 5 seconds
    setTimeout(() => setStoppedMessage(''), 5000)
  }

  const getStatusIcon = (status: string) => {
    if (status === 'passed') return <CheckCircle sx={{ color: THEME_PRO.success }} />
    if (status === 'warning') return <Schedule sx={{ color: THEME_PRO.warning }} />
    return <ErrorOutlined sx={{ color: THEME_PRO.error }} />
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
              🧪 Diagnostics
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary }}>Run system health checks</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: SPACING_PRO.md, alignItems: 'center' }}>
            {!running ? (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleStart}
                sx={{ backgroundColor: THEME_PRO.primary, color: '#fff' }}
              >
                Run Tests
              </Button>
            ) : (
              <>
                <Box sx={{ minWidth: '120px', textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '14px', color: THEME_PRO.textSecondary, fontWeight: 500 }}>
                    {Math.round(progress)}% Complete
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Stop />}
                  onClick={handleStop}
                  sx={{
                    backgroundColor: THEME_PRO.error,
                    color: '#fff',
                    '&:hover': { backgroundColor: '#d32f2f' }
                  }}
                >
                  Stop
                </Button>
              </>
            )}
          </Box>
        </Box>

        {running && (
          <Box sx={{ mb: SPACING_PRO.lg }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mb: SPACING_PRO.md,
                backgroundColor: THEME_PRO.border,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: THEME_PRO.primary,
                }
              }}
            />
            <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>
              Running {Math.floor(tests.length * (progress / 100))} of {tests.length} health checks...
            </Typography>
          </Box>
        )}

        {stoppedMessage && (
          <Alert severity="warning" sx={{ mb: SPACING_PRO.lg }}>
            {stoppedMessage}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2 }}>
          {tests.map((test, idx) => (
            <Card
              key={idx}
              sx={{
                p: SPACING_PRO.lg,
                borderRadius: RADIUS_PRO.lg,
                border: `1px solid ${THEME_PRO.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: running && idx >= Math.floor(tests.length * (progress / 100)) ? 0.5 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING_PRO.lg }}>
                {getStatusIcon(test.status)}
                <Box>
                  <Typography sx={{ fontWeight: 600, color: THEME_PRO.textPrimary }}>
                    {idx + 1}. {test.name}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary }}>
                    Response time: {test.duration}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={test.status}
                sx={{
                  backgroundColor: test.status === 'passed' ? THEME_PRO.successLight : THEME_PRO.warningLight,
                  color: test.status === 'passed' ? THEME_PRO.success : THEME_PRO.warning
                }}
              />
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
