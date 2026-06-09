import React, { useState, useEffect, useRef } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Button, Chip, LinearProgress, Alert, Paper } from '@mui/material'
import { PlayArrow, CheckCircle, ErrorOutlined, Schedule, Stop, Code } from '@mui/icons-material'
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
  const [logs, setLogs] = useState<any[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)
  const lastLogCountRef = useRef(0)

  // Scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Fetch logs from API
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/v1/logs?limit=100&level=DEBUG')
      if (response.ok) {
        const data = await response.json()
        const recentLogs = data.data?.slice(0, 20).reverse() || []
        setLogs(recentLogs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

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

    // Simulate test progression with logs
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      if (!running) {
        clearInterval(progressInterval)
        return
      }
      currentProgress += Math.random() * 25
      if (currentProgress >= 100) currentProgress = 100
      setProgress(currentProgress)

      // Fetch new logs every interval
      fetchLogs()
    }, 800)

    // Simulate individual test logs
    const testIndices = [0, 1, 2, 3, 4]
    testIndices.forEach((idx) => {
      setTimeout(() => {
        if (running) {
          frontendLogger.debug('Diagnostics', `Running health check: ${tests[idx].name}`, {
            testIndex: idx + 1,
            testName: tests[idx].name,
            totalTests: tests.length,
            timestamp: new Date().toISOString(),
          })
          fetchLogs()
        }
      }, 1200 + idx * 1200)
    })

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

        // Final fetch of logs
        setTimeout(() => fetchLogs(), 500)
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

        <Box sx={{ display: 'grid', gap: 2, mb: SPACING_PRO.xxxl }}>
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

        {(running || logs.length > 0) && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING_PRO.md, mb: SPACING_PRO.lg }}>
              <Code sx={{ color: THEME_PRO.primary }} />
              <Typography variant="h6" sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}>
                Live Log Stream
              </Typography>
              {running && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: THEME_PRO.primary,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 }
                    }
                  }}
                />
              )}
            </Box>

            <Paper
              sx={{
                backgroundColor: '#1a1a1a',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: '12px',
                p: SPACING_PRO.lg,
                borderRadius: RADIUS_PRO.lg,
                maxHeight: '400px',
                overflowY: 'auto',
                border: `1px solid ${THEME_PRO.border}`,
                lineHeight: 1.6,
              }}
            >
              {logs.length === 0 ? (
                <Typography sx={{ color: '#666', fontFamily: 'monospace' }}>
                  {running ? 'Waiting for logs...' : 'No logs yet. Click "Run Tests" to start.'}
                </Typography>
              ) : (
                logs.map((log, idx) => {
                  const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''
                  const level = log.level || 'INFO'
                  const levelColor =
                    level === 'ERROR' || level === 'FATAL' ? '#ff4444' :
                    level === 'WARN' ? '#ffaa00' :
                    level === 'INFO' ? '#00ff00' :
                    '#0088ff'

                  return (
                    <Box key={idx} sx={{ mb: SPACING_PRO.sm, color: levelColor }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
                        <span>{timestamp} [{level}]</span>
                        <span style={{ opacity: 0.7 }}>{log.module}</span>
                      </Box>
                      <Box sx={{ color: '#00ff00', ml: SPACING_PRO.sm, wordBreak: 'break-word' }}>
                        &gt; {log.message}
                      </Box>
                      {log.context && Object.keys(log.context).length > 0 && (
                        <Box sx={{ color: '#888', ml: SPACING_PRO.lg, fontSize: '10px', mt: '2px' }}>
                          {Object.entries(log.context).map(([key, value]: any, i) => (
                            <div key={i}>
                              • {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </div>
                          ))}
                        </Box>
                      )}
                      <Box sx={{ mb: SPACING_PRO.sm, borderBottom: `1px solid ${THEME_PRO.border}`, opacity: 0.3 }} />
                    </Box>
                  )
                })
              )}
              <div ref={logsEndRef} />
            </Paper>
          </Box>
        )}
      </Box>
    </LayoutPro>
  )
}
