/**
 * Trading Bot Page
 *
 * Main page for the autonomous trading bot feature.
 * Displays the trading bot interface with settings and trading tabs.
 */

import { TradingBot } from '../components/TradingBot'

export const TradingBotPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TradingBot />
    </div>
  )
}

export default TradingBotPage
