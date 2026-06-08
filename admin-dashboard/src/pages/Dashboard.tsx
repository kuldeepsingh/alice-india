import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material'
import { TrendingUp, ShoppingCart, AssignmentInd, Trending } from '@mui/icons-material'
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../theme'

interface StatItem {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  gradient: string
  change?: number
}

export function Dashboard() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      title: 'Total Users',
      value: 2450,
      subtitle: 'All registered users',
      icon: <AssignmentInd sx={{ fontSize: 40 }} />,
      gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      change: 12,
    },
    {
      title: 'Trading Accounts',
      value: 856,
      subtitle: 'Active accounts',
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      gradient: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`,
      change: 8,
    },
    {
      title: 'Total Orders',
      value: 12500,
      subtitle: 'All-time trades',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      gradient: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`,
      change: 23,
    },
    {
      title: 'Active Traders',
      value: 1203,
      subtitle: 'Trading this month',
      icon: <Trending sx={{ fontSize: 40 }} />,
      gradient: `linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)`,
      change: 15,
    },
  ])

  useEffect(() => {
    // Simulate data loading
    setStats(stats)
  }, [])

  return (
    <Layout>
      <Box sx={{ p: SPACING.xl }}>
        {/* Header Section */}
        <Box sx={{ mb: SPACING.xxl }}>
          <Typography
            variant="h4"
            sx={{
              color: COLORS.primary,
              fontWeight: '700',
              mb: SPACING.md,
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: COLORS.textSecondary,
            }}
          >
            Real-time statistics and platform metrics
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: SPACING.xxl }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: stat.gradient,
                  backgroundAttachment: 'fixed',
                  borderRadius: BORDER_RADIUS.lg,
                  boxShadow: SHADOWS.md,
                  transition: TRANSITIONS.normal,
                  cursor: 'pointer',
                  border: `1px solid ${COLORS.primary}40`,
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: SHADOWS.lg,
                  },
                }}
              >
                <CardContent sx={{ p: SPACING.xl }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SPACING.md }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: SPACING.sm,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: '#ffffff',
                          fontWeight: '700',
                          mb: SPACING.xs,
                        }}
                      >
                        {stat.value.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                  {stat.change && (
                    <Chip
                      label={`+${stat.change}% this month`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontWeight: '600',
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity Section */}
        <Paper
          sx={{
            backgroundColor: COLORS.bgMedium,
            borderLeft: `4px solid ${COLORS.primary}`,
            borderRadius: BORDER_RADIUS.lg,
            p: SPACING.xl,
            boxShadow: SHADOWS.md,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: COLORS.primary,
              fontWeight: '700',
              mb: SPACING.lg,
            }}
          >
            Recent Activity
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: SPACING.xxl,
              color: COLORS.textSecondary,
            }}
          >
            <Typography variant="body1" sx={{ mb: SPACING.md }}>
              📊 No recent activity yet
            </Typography>
            <Typography variant="caption">
              Trading activities and orders will appear here in real-time
            </Typography>
          </Box>
        </Paper>

        {/* System Health */}
        <Grid container spacing={3} sx={{ mt: SPACING.lg }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                backgroundColor: COLORS.bgMedium,
                borderLeft: `4px solid ${COLORS.success}`,
                p: SPACING.lg,
                borderRadius: BORDER_RADIUS.lg,
                boxShadow: SHADOWS.md,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING.md }}>
                <Typography variant="subtitle1" sx={{ color: COLORS.primary, fontWeight: '700' }}>
                  System Health
                </Typography>
                <Chip label="Healthy" size="small" sx={{ backgroundColor: COLORS.success, color: '#fff' }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={95}
                sx={{
                  backgroundColor: COLORS.bgLight,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: COLORS.success,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: COLORS.textTertiary, display: 'block', mt: SPACING.md }}>
                System uptime: 99.9% | Response time: 145ms
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                backgroundColor: COLORS.bgMedium,
                borderLeft: `4px solid ${COLORS.primary}`,
                p: SPACING.lg,
                borderRadius: BORDER_RADIUS.lg,
                boxShadow: SHADOWS.md,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING.md }}>
                <Typography variant="subtitle1" sx={{ color: COLORS.primary, fontWeight: '700' }}>
                  Database
                </Typography>
                <Chip label="Connected" size="small" sx={{ backgroundColor: COLORS.success, color: '#fff' }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={88}
                sx={{
                  backgroundColor: COLORS.bgLight,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: COLORS.info,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: COLORS.textTertiary, display: 'block', mt: SPACING.md }}>
                Connections: 42 | Queries/sec: 1,250
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}
