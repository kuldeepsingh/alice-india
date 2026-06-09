import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  Dashboard,
  People,
  AccountBalance,
  ShoppingCart,
  TrendingUp,
  Settings,
  Build,
  Description,
  ErrorOutlined,
  History,
  BugReport,
  WarningAmber,
  Group,
  Speed,
  SmartToy,
  BarChart,
} from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, TRANSITIONS_PRO } from '../theme-pro'

const menuSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/', icon: Dashboard },
      { label: 'Users', path: '/users', icon: People },
      { label: 'Accounts', path: '/accounts', icon: AccountBalance },
      { label: 'Orders', path: '/orders', icon: ShoppingCart },
      { label: 'Market', path: '/market', icon: BarChart },
      { label: 'Trading', path: '/trading', icon: TrendingUp },
      { label: 'Autonomous Bot', path: '/trading-bot', icon: SmartToy },
      { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
      { label: 'Diagnostics', path: '/diagnostics', icon: Build },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Logs', path: '/logs', icon: Description },
      { label: 'Errors', path: '/errors', icon: ErrorOutlined },
      { label: 'Audit Trail', path: '/audit', icon: History },
      { label: 'Debug', path: '/debug', icon: BugReport },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Incidents', path: '/incidents', icon: WarningAmber },
      { label: 'Team', path: '/team', icon: Group },
      { label: 'Performance', path: '/performance', icon: Speed },
    ],
  },
]

export function SidebarPro() {
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState<string>('Main')

  const isActive = (path: string) => location.pathname === path

  return (
    <Box
      sx={{
        width: '280px',
        height: '100vh',
        backgroundColor: THEME_PRO.bgSecondary,
        borderRight: `1px solid ${THEME_PRO.border}`,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        p: SPACING_PRO.lg,
      }}
    >
      <List sx={{ flex: 1 }}>
        {menuSections.map((section) => (
          <Box key={section.title}>
            <Box
              sx={{
                px: SPACING_PRO.md,
                py: SPACING_PRO.lg,
                fontSize: '11px',
                fontWeight: 700,
                color: THEME_PRO.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {section.title}
            </Box>

            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Tooltip key={item.path} title={item.label} placement="right" arrow>
                  <ListItem
                    component={Link}
                    to={item.path}
                    sx={{
                      px: SPACING_PRO.md,
                      py: SPACING_PRO.md,
                      mb: SPACING_PRO.xs,
                      borderRadius: RADIUS_PRO.md,
                      color: active ? THEME_PRO.primary : THEME_PRO.textSecondary,
                      backgroundColor: active ? THEME_PRO.primaryLight : 'transparent',
                      border: active ? `1px solid ${THEME_PRO.primary}` : 'none',
                      fontWeight: active ? 600 : 500,
                      transition: TRANSITIONS_PRO.normal,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        backgroundColor: active ? THEME_PRO.primaryLight : THEME_PRO.bgTertiary,
                        color: THEME_PRO.primary,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: '40px',
                      }}
                    >
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: '14px',
                          fontWeight: 'inherit',
                        },
                      }}
                    />
                  </ListItem>
                </Tooltip>
              )
            })}

            <Divider sx={{ my: SPACING_PRO.lg, borderColor: THEME_PRO.border }} />
          </Box>
        ))}
      </List>

      {/* Footer */}
      <Box
        sx={{
          p: SPACING_PRO.md,
          borderTop: `1px solid ${THEME_PRO.border}`,
          textAlign: 'center',
          fontSize: '12px',
          color: THEME_PRO.textTertiary,
        }}
      >
        <div>v1.0.0</div>
        <div sx={{ mt: SPACING_PRO.xs }}>Professional Trading Platform</div>
      </Box>
    </Box>
  )
}
