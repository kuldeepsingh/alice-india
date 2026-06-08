export const helpContent: { [key: string]: { title: string; sections: Array<{ heading: string; content: string }> } } = {
  '/': {
    title: '📊 Dashboard Help',
    sections: [
      {
        heading: 'Overview',
        content: 'The Dashboard displays your key trading metrics including portfolio value, active positions, daily profit/loss, and win rate.'
      },
      {
        heading: 'Key Metrics',
        content: 'View real-time statistics about your trading performance. Click on any metric card to drill down into details.'
      },
      {
        heading: 'Portfolio Allocation',
        content: 'See how your investments are distributed across different asset classes (Stocks, Crypto, Commodities, Forex).'
      },
      {
        heading: 'Account Balance',
        content: 'Monitor your account balance and quickly access deposit/withdrawal options. Click "Show/Hide Values" for privacy.'
      },
    ]
  },
  '/users': {
    title: '👥 Users Management Help',
    sections: [
      {
        heading: 'Manage Users',
        content: 'Add, edit, and delete user accounts. Control who has access to the trading platform.'
      },
      {
        heading: 'Search Users',
        content: 'Use the search bar to quickly find users by name or email address.'
      },
      {
        heading: 'User Roles',
        content: 'Assign different roles (Admin, Trader, Analyst) to control user permissions and access levels.'
      },
      {
        heading: 'User Status',
        content: 'View active or inactive users. Inactive users cannot access the platform.'
      },
    ]
  },
  '/accounts': {
    title: '💼 Trading Accounts Help',
    sections: [
      {
        heading: 'View Accounts',
        content: 'See all your trading accounts with their current balance, equity, and open positions.'
      },
      {
        heading: 'Account Types',
        content: 'Live accounts use real money, Demo accounts are for practice. Status shows if the account is active or inactive.'
      },
      {
        heading: 'Balance & Equity',
        content: 'Balance is your total account value. Equity is your balance minus margin used by open positions.'
      },
      {
        heading: 'Open Positions',
        content: 'Number of active trades in each account. Click to view position details.'
      },
    ]
  },
  '/orders': {
    title: '📊 Orders Help',
    sections: [
      {
        heading: 'View Orders',
        content: 'See all buy and sell orders with symbols, quantities, prices, and current status.'
      },
      {
        heading: 'Order Status',
        content: 'Filled = completed, Pending = waiting to execute, Cancelled = manually cancelled.'
      },
      {
        heading: 'Order Types',
        content: 'Buy orders increase your position, Sell orders decrease or reverse your position.'
      },
      {
        heading: 'Order History',
        content: 'View the complete history of all your trading orders with timestamps.'
      },
    ]
  },
  '/trading': {
    title: '📈 Trading Help',
    sections: [
      {
        heading: 'Place Orders',
        content: 'Enter symbol, quantity, and price. Choose Buy or Sell, then click Place Order.'
      },
      {
        heading: 'Market Watch',
        content: 'Monitor live stock prices and trends. Green up arrow = price increasing, Red down arrow = price decreasing.'
      },
      {
        heading: 'Quick Trading',
        content: 'Use preset symbols or enter custom ones. All orders are executed with real-time market data.'
      },
      {
        heading: 'Risk Management',
        content: 'Always set appropriate stop-loss and take-profit levels before placing orders.'
      },
    ]
  },
  '/analytics': {
    title: '📉 Analytics Help',
    sections: [
      {
        heading: 'Trading Analytics',
        content: 'View detailed performance metrics including total trades, win rate, average return, and risk/reward ratio.'
      },
      {
        heading: 'Performance by Strategy',
        content: 'Compare performance across different trading strategies you use.'
      },
      {
        heading: 'Metrics Explained',
        content: 'Win Rate = % of profitable trades, Avg Return = average profit per trade, Risk/Reward = risk vs potential gain ratio.'
      },
      {
        heading: 'Data Export',
        content: 'Download analytics data for further analysis in spreadsheets or other tools.'
      },
    ]
  },
  '/settings': {
    title: '⚙️ Settings Help',
    sections: [
      {
        heading: 'API Configuration',
        content: 'Add your trading API key for automated trading. Keep your API key secure and never share it.'
      },
      {
        heading: 'API Key Security',
        content: 'Use the eye icon to show/hide your API key. Copy button saves it to your clipboard.'
      },
      {
        heading: 'Theme Preferences',
        content: 'Toggle Dark Mode, Notifications, and Auto-Refresh to customize your experience.'
      },
      {
        heading: 'Save Settings',
        content: 'All changes are saved to your browser. Use "Reset to Defaults" to restore original settings.'
      },
    ]
  },
  '/diagnostics': {
    title: '🧪 Diagnostics Help',
    sections: [
      {
        heading: 'Run Tests',
        content: 'Click "Run Tests" to check if all system components are working correctly.'
      },
      {
        heading: 'Test Results',
        content: 'Green checkmark = passed, Yellow clock = warning, Red X = failed.'
      },
      {
        heading: 'Response Time',
        content: 'Shows how quickly each system component responds. Lower is better (typical: under 500ms).'
      },
      {
        heading: 'Troubleshooting',
        content: 'If tests fail, check your internet connection and backend server status.'
      },
    ]
  },
  '/logs': {
    title: '📋 System Logs Help',
    sections: [
      {
        heading: 'View Logs',
        content: 'See all system events and activities. Logs are essential for debugging issues.'
      },
      {
        heading: 'Log Levels',
        content: 'INFO = normal events, DEBUG = detailed info, WARNING = potential issues, ERROR = something went wrong.'
      },
      {
        heading: 'Filter Logs',
        content: 'Filter by module (API, DB, Cache, ORDER) to find specific information.'
      },
      {
        heading: 'Timestamps',
        content: 'All logs include exact timestamps for correlating events across systems.'
      },
    ]
  },
  '/errors': {
    title: '🚨 Error Tracking Help',
    sections: [
      {
        heading: 'Track Errors',
        content: 'Monitor system errors and issues that need attention.'
      },
      {
        heading: 'Severity Levels',
        content: 'Critical = system down, High = major issue, Medium = moderate issue, Low = minor issue.'
      },
      {
        heading: 'Error Details',
        content: 'Each error shows count and last occurrence time. Click to view full error details.'
      },
      {
        heading: 'Resolution',
        content: 'Contact support or check documentation for how to resolve errors.'
      },
    ]
  },
  '/audit': {
    title: '📄 Audit Trail Help',
    sections: [
      {
        heading: 'Track Changes',
        content: 'See who did what and when. Audit trail maintains a complete history of all user actions.'
      },
      {
        heading: 'Compliance',
        content: 'Audit logs are essential for regulatory compliance and security audits.'
      },
      {
        heading: 'Activity Details',
        content: 'Each log entry shows user, action, timestamp, and what changed.'
      },
      {
        heading: 'Search & Export',
        content: 'Search by user or action type. Export audit logs for external analysis.'
      },
    ]
  },
  '/debug': {
    title: '🐛 Debug Sessions Help',
    sections: [
      {
        heading: 'Monitor API',
        content: 'Track all API requests and responses in real-time for debugging.'
      },
      {
        heading: 'Response Times',
        content: 'See how long each API call takes. Slow responses indicate potential performance issues.'
      },
      {
        heading: 'Status Codes',
        content: 'Success = 200-299, Error = 400-599. Hover for details.'
      },
      {
        heading: 'Debugging',
        content: 'Use debug logs to troubleshoot integration issues with external APIs.'
      },
    ]
  },
  '/incidents': {
    title: '🔴 Incidents Help',
    sections: [
      {
        heading: 'Track Incidents',
        content: 'Monitor and manage system incidents and outages.'
      },
      {
        heading: 'Incident Status',
        content: 'Open = currently happening, Investigating = being worked on, Resolved = fixed.'
      },
      {
        heading: 'Severity Scale',
        content: 'Use severity levels to prioritize incident response and impact assessment.'
      },
      {
        heading: 'Communication',
        content: 'Log all incident updates and notify affected users of issues and resolutions.'
      },
    ]
  },
  '/team': {
    title: '👨‍💼 Team Coordination Help',
    sections: [
      {
        heading: 'Team Members',
        content: 'View all team members, their roles, and online status.'
      },
      {
        heading: 'Performance Stats',
        content: 'See each member\'s trade count and win rate to assess team performance.'
      },
      {
        heading: 'Online Status',
        content: 'Green dot = online and available, Gray dot = offline.'
      },
      {
        heading: 'Collaboration',
        content: 'Use team stats to identify top performers and share best practices.'
      },
    ]
  },
  '/performance': {
    title: '⚡ Performance Metrics Help',
    sections: [
      {
        heading: 'Monitor Performance',
        content: 'Track system performance metrics like response times, memory usage, and CPU usage.'
      },
      {
        heading: 'Metric Ranges',
        content: 'Green = healthy, Yellow = warning, Red = critical. Values shown as percentage or milliseconds.'
      },
      {
        heading: 'Response Time',
        content: 'Under 200ms is excellent, 200-500ms is good, over 500ms needs optimization.'
      },
      {
        heading: 'Optimization',
        content: 'If metrics are red, contact system administrator for optimization.'
      },
    ]
  },
}
