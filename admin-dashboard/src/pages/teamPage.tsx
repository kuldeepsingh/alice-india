import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, Avatar, Chip } from '@mui/material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'

const teamMembers = [
  { name: 'Raj Kumar', role: 'Team Lead', status: 'Online', trades: 234, winRate: '67.5%' },
  { name: 'Priya Singh', role: 'Trader', status: 'Online', trades: 156, winRate: '71.2%' },
  { name: 'Amit Patel', role: 'Analyst', status: 'Offline', trades: 89, winRate: '65.8%' },
  { name: 'Neha Gupta', role: 'Trader', status: 'Online', trades: 202, winRate: '68.9%' },
]

export function teamPage() {
  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            👨‍💼 Team Coordination
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>Manage team members and track performance</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {teamMembers.map((member, idx) => (
            <Card key={idx} sx={{ p: SPACING_PRO.xl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}`, display: 'flex', gap: SPACING_PRO.lg, alignItems: 'center' }}>
              <Avatar sx={{ width: 56, height: 56, background: THEME_PRO.gradientPrimary, fontSize: '24px', fontWeight: 700 }}>
                {member.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}>{member.name}</Typography>
                <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.sm }}>{member.role}</Typography>
                <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
                  <Chip size="small" label={member.status} sx={{ backgroundColor: member.status === 'Online' ? THEME_PRO.successLight : THEME_PRO.bgTertiary, color: member.status === 'Online' ? THEME_PRO.success : THEME_PRO.textSecondary }} />
                  <Chip size="small" label={`${member.trades} trades`} sx={{ backgroundColor: THEME_PRO.primaryLight, color: THEME_PRO.primary }} />
                  <Chip size="small" label={member.winRate} sx={{ backgroundColor: THEME_PRO.successLight, color: THEME_PRO.success }} />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </LayoutPro>
  )
}
