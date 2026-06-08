/**
 * Trading Bot Page
 *
 * Main page for the autonomous trading bot feature.
 * Displays the trading bot interface with settings and trading tabs.
 */

import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Typography } from '@mui/material'
import { TradingBot } from '../components/TradingBot'
import { THEME_PRO, SPACING_PRO } from '../theme-pro'
import { frontendLogger } from '../services/logging-client'

export function TradingBotPage() {
  React.useEffect(() => {
    frontendLogger.debug('TradingBotPage', 'Page loaded', {
      route: '/trading-bot',
      timestamp: new Date().toISOString(),
    })
  }, [])

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl, backgroundColor: THEME_PRO.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography variant="h4" sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.md }}>
            🤖 Autonomous Trading Bot
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>
            Configure your API keys and manage automated trading with Claude AI integration
          </Typography>
        </Box>

        {/* Trading Bot Component */}
        <TradingBot />
      </Box>
    </LayoutPro>
  )
}

export default TradingBotPage
