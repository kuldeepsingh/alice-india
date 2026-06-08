import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Breadcrumbs, Link, Typography, Box } from '@mui/material'
import { NavigateNext } from '@mui/icons-material'
import { COLORS, SPACING, TRANSITIONS } from '../theme'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/accounts': 'Accounts',
  '/orders': 'Orders',
  '/analytics': 'Analytics',
  '/trading': 'Trading',
  '/settings': 'Settings',
  '/diagnostics': 'Diagnostics',
  '/logs': 'Logs',
  '/errors': 'Errors',
  '/audit': 'Audit Trail',
  '/debug': 'Debug Sessions',
  '/incidents': 'Incidents',
  '/team': 'Team Coordination',
  '/performance': 'Performance',
}

export function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  // Build breadcrumbs
  const breadcrumbPaths = ['/']
  const parts = pathname.split('/').filter(Boolean)

  parts.forEach((part, index) => {
    breadcrumbPaths.push('/' + parts.slice(0, index + 1).join('/'))
  })

  const breadcrumbs = breadcrumbPaths.map((path) => ({
    label: ROUTE_LABELS[path] || path.slice(1).replace(/-/g, ' ').toUpperCase(),
    path,
  }))

  // Don't show breadcrumb on home page
  if (pathname === '/') {
    return null
  }

  return (
    <Box
      sx={{
        px: SPACING.xl,
        py: SPACING.md,
        backgroundColor: COLORS.bgDark,
        borderBottom: `1px solid ${COLORS.primary}40`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Breadcrumbs
        separator={<NavigateNext sx={{ color: COLORS.primary, fontSize: '18px' }} />}
        sx={{
          '& .MuiBreadcrumbs-ol': {
            gap: SPACING.sm,
          },
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          if (isLast) {
            return (
              <Typography
                key={breadcrumb.path}
                sx={{
                  color: COLORS.primary,
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                {breadcrumb.label}
              </Typography>
            )
          }

          return (
            <Link
              key={breadcrumb.path}
              onClick={() => navigate(breadcrumb.path)}
              sx={{
                color: COLORS.textSecondary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: TRANSITIONS.fast,
                textDecoration: 'none',
                '&:hover': {
                  color: COLORS.primary,
                  textDecoration: 'underline',
                },
              }}
            >
              {breadcrumb.label}
            </Link>
          )
        })}
      </Breadcrumbs>
    </Box>
  )
}
