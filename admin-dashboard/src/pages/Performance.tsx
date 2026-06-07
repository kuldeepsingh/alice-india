/**
 * Performance Monitoring Dashboard
 * Real-time cache and API performance metrics
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material'
import { styled } from '@mui/material/styles'

interface CacheStats {
  hits: number
  misses: number
  total: number
  hitRatio: string
  cacheSize: number
  memoryEstimate: string
}

interface DatabaseStats {
  totalQueries: number
  avgDuration: number
  maxDuration: number
  minDuration: number
  totalRows: number
  cachedQueries: number
  slowQueries: number
}

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}))

const MetricRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: '1px solid #eee',

  '&:last-child': {
    borderBottom: 'none',
  },
}))

export default function Performance() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      setLoading(true)

      const [cacheRes, dbRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/metrics/cache', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('http://localhost:3000/api/v1/metrics/database', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ])

      if (!cacheRes.ok || !dbRes.ok) throw new Error('Failed to fetch metrics')

      const cacheData = await cacheRes.json()
      const dbData = await dbRes.json()

      setCacheStats(cacheData.data.cache)
      setDbStats(dbData.data.statistics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/metrics/cache/clear', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (res.ok) {
        fetchMetrics()
      }
    } catch (err) {
      console.error('Error clearing cache:', err)
    }
  }

  useEffect(() => {
    fetchMetrics()

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000) // 10 second refresh
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ⚡ Performance Metrics
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ mr: 1 }}
          >
            {autoRefresh ? '⏸ Stop' : '▶ Start'} Auto-Refresh
          </Button>
          <Button variant="contained" onClick={fetchMetrics}>
            🔄 Refresh Now
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Cache Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cache Hit Ratio
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {cacheStats?.hitRatio || '0%'}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseInt(cacheStats?.hitRatio || '0')}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cache Size
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {cacheStats?.cacheSize || 0}
                  </Typography>
                  <Typography variant="body2">Items cached</Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Memory Usage
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {cacheStats?.memoryEstimate || '0 B'}
                  </Typography>
                  <Typography variant="body2">Estimated</Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {cacheStats?.total || 0}
                  </Typography>
                  <Typography variant="body2">
                    {cacheStats?.hits || 0} hits, {cacheStats?.misses || 0} misses
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Database Performance */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              🗄️ Database Performance
            </Typography>

            <MetricRow>
              <Typography>Total Queries Executed</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>{dbStats?.totalQueries || 0}</Typography>
            </MetricRow>

            <MetricRow>
              <Typography>Average Query Time</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>
                {dbStats?.avgDuration || 0}ms
              </Typography>
            </MetricRow>

            <MetricRow>
              <Typography>Cached Queries</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>{dbStats?.cachedQueries || 0}</Typography>
            </MetricRow>

            <MetricRow>
              <Typography>Slow Queries (&gt;100ms)</Typography>
              <Typography sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {dbStats?.slowQueries || 0}
              </Typography>
            </MetricRow>

            <MetricRow>
              <Typography>Max Query Time</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>{dbStats?.maxDuration || 0}ms</Typography>
            </MetricRow>

            <MetricRow>
              <Typography>Min Query Time</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>{dbStats?.minDuration || 0}ms</Typography>
            </MetricRow>

            <MetricRow>
              <Typography>Total Rows Processed</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>{dbStats?.totalRows || 0}</Typography>
            </MetricRow>
          </Paper>

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              ⚙️ Cache Management
            </Typography>

            <Button variant="contained" color="error" onClick={clearCache}>
              Clear All Cache
            </Button>

            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              ⏱️ Metrics refresh rate: {autoRefresh ? '10 seconds' : 'Manual'}
            </Typography>
          </Paper>
        </>
      )}
    </Container>
  )
}
