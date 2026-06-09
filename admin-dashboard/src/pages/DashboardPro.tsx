import React, { useEffect } from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, LinearProgress, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material'
import { TrendingUp, TrendingDown, Visibility, VisibilityOff } from '@mui/icons-material'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../state/store'
import { formatCurrency, getCurrencyByCode } from '../content/currencies'
import { frontendLogger } from '../services/logging-client'
import { analyticsAPI } from '../services/api-services'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO, SHADOWS_PRO, TRANSITIONS_PRO } from '../theme-pro'

interface StatCard {
  title: string
  value: string
  change: number
  isPositive: boolean
  icon: React.ReactNode
}

export function DashboardPro() {
  const [showValues, setShowValues] = React.useState(true)
  const [withdrawalOpen, setWithdrawalOpen] = React.useState(false)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = React.useState('')
  const [depositAmount, setDepositAmount] = React.useState('')
  const [withdrawalMessage, setWithdrawalMessage] = React.useState('')
  const [depositMessage, setDepositMessage] = React.useState('')
  const [accountBalance, setAccountBalance] = React.useState(287450)
  const { currency } = useAuthStore()
  const currencyInfo = getCurrencyByCode(currency)

  const handleWithdrawal = () => {
    frontendLogger.debug('Withdrawal', 'Withdrawal attempt started', { amount: withdrawalAmount })

    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      frontendLogger.error('Withdrawal', 'Invalid amount', new Error('Invalid amount'), {
        amount: withdrawalAmount,
      })
      setWithdrawalMessage('❌ Please enter a valid amount')
      return
    }

    const amount = parseFloat(withdrawalAmount)
    if (amount > accountBalance) {
      frontendLogger.error('Withdrawal', 'Insufficient balance', new Error('Insufficient balance'), {
        amount,
        balance: accountBalance,
      })
      setWithdrawalMessage('❌ Insufficient balance for this withdrawal')
      return
    }

    frontendLogger.info('Withdrawal', 'Withdrawal submitted', {
      amount: formatCurrency(amount, currency),
      currency,
    })

    setWithdrawalMessage(`✅ Withdrawal request of ${formatCurrency(amount, currency)} submitted! Processing...`)
    setTimeout(() => {
      setAccountBalance(accountBalance - amount)
      frontendLogger.info('Withdrawal', 'Withdrawal processed', {
        amount: formatCurrency(amount, currency),
        newBalance: formatCurrency(accountBalance - amount, currency),
      })
      setWithdrawalOpen(false)
      setWithdrawalAmount('')
      setWithdrawalMessage('')
    }, 3000)
  }

  const handleDeposit = () => {
    frontendLogger.debug('Deposit', 'Deposit attempt started', { amount: depositAmount })

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      frontendLogger.error('Deposit', 'Invalid amount', new Error('Invalid amount'), {
        amount: depositAmount,
      })
      setDepositMessage('❌ Please enter a valid amount')
      return
    }

    const amount = parseFloat(depositAmount)
    frontendLogger.info('Deposit', 'Deposit submitted', {
      amount: formatCurrency(amount, currency),
      currency,
    })

    setDepositMessage(`✅ Deposit of ${formatCurrency(amount, currency)} submitted! Processing...`)
    setTimeout(() => {
      setAccountBalance(accountBalance + amount)
      frontendLogger.info('Deposit', 'Deposit processed', {
        amount: formatCurrency(amount, currency),
        newBalance: formatCurrency(accountBalance + amount, currency),
      })
      setDepositOpen(false)
      setDepositAmount('')
      setDepositMessage('')
    }, 3000)
  }

  // Fetch dashboard analytics from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await analyticsAPI.getAnalytics()
        if (analytics && analytics.balance) {
          setAccountBalance(analytics.balance)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        // Keep using default values
      }
    }

    fetchAnalytics()
  }, [])

  // Chart data
  const portfolioData = [
    { date: 'Mon', value: 2750000 },
    { date: 'Tue', value: 2780000 },
    { date: 'Wed', value: 2800000 },
    { date: 'Thu', value: 2765000 },
    { date: 'Fri', value: 2847500 },
  ]

  const dailyReturnsData = [
    { time: '09:00', return: 0.2 },
    { time: '11:00', return: 0.5 },
    { time: '13:00', return: 0.8 },
    { time: '15:00', return: 0.3 },
    { time: '16:00', return: 1.2 },
  ]

  const strategyData = [
    { name: 'Trend Following', value: 45 },
    { name: 'Mean Reversion', value: 30 },
    { name: 'Momentum', value: 15 },
    { name: 'Other', value: 10 },
  ]

  const COLORS = [THEME_PRO.primary, THEME_PRO.success, THEME_PRO.warning, THEME_PRO.error]

  const stats: StatCard[] = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(2847500, currency),
      change: 12.5,
      isPositive: true,
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
    },
    {
      title: 'Active Positions',
      value: '24',
      change: 5.2,
      isPositive: true,
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
    },
    {
      title: 'Daily Profit/Loss',
      value: formatCurrency(12450, currency),
      change: -2.1,
      isPositive: false,
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
    },
    {
      title: 'Win Rate',
      value: '68.4%',
      change: 3.7,
      isPositive: true,
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
    },
  ]

  return (
    <LayoutPro>
      <Box
        sx={{
          p: SPACING_PRO.xxxl,
          backgroundColor: THEME_PRO.bgPrimary,
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: SPACING_PRO.xxxl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: '32px',
                fontWeight: 700,
                color: THEME_PRO.textPrimary,
                mb: SPACING_PRO.md,
              }}
            >
              Trading Dashboard
            </Typography>
            <Typography sx={{ color: THEME_PRO.textSecondary, fontSize: '14px' }}>
              Welcome back! Here's your trading overview • Currency: {currencyInfo.symbol} {currency}
            </Typography>
          </Box>
          <Button
            startIcon={showValues ? <Visibility /> : <VisibilityOff />}
            onClick={() => setShowValues(!showValues)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: THEME_PRO.primary,
              border: `1px solid ${THEME_PRO.border}`,
              borderRadius: RADIUS_PRO.md,
              px: SPACING_PRO.lg,
              py: SPACING_PRO.md,
              '&:hover': {
                backgroundColor: THEME_PRO.primaryLight,
              },
            }}
          >
            {showValues ? 'Hide' : 'Show'} Values
          </Button>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: SPACING_PRO.xxxl }}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Card
                sx={{
                  p: SPACING_PRO.xxl,
                  borderRadius: RADIUS_PRO.lg,
                  border: `1px solid ${THEME_PRO.border}`,
                  transition: TRANSITIONS_PRO.normal,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: SHADOWS_PRO.lg,
                    transform: 'translateY(-4px)',
                    borderColor: THEME_PRO.primary,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SPACING_PRO.lg }}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: THEME_PRO.textTertiary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: SPACING_PRO.md,
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: THEME_PRO.textPrimary,
                      }}
                    >
                      {showValues ? stat.value : '••••••'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '50px',
                      height: '50px',
                      background: stat.isPositive ? THEME_PRO.gradientSuccess : THEME_PRO.gradientError,
                      borderRadius: RADIUS_PRO.lg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: THEME_PRO.textInverse,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>

                <Chip
                  label={`${stat.isPositive ? '+' : '-'}${Math.abs(stat.change)}% this month`}
                  size="small"
                  sx={{
                    background: stat.isPositive ? THEME_PRO.successLight : THEME_PRO.errorLight,
                    color: stat.isPositive ? '#059669' : '#DC2626',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                />
              </Card>
            </Box>
          ))}
        </Box>

        {/* Performance Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Card
              sx={{
                p: SPACING_PRO.xxl,
                borderRadius: RADIUS_PRO.lg,
                border: `1px solid ${THEME_PRO.border}`,
              }}
            >
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Portfolio Allocation
              </Typography>

              {['Stocks', 'Crypto', 'Commodities', 'Forex'].map((category, idx) => (
                <Box key={category} sx={{ mb: SPACING_PRO.lg }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.sm }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: THEME_PRO.textSecondary }}>
                      {category}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: THEME_PRO.primary }}>
                      {45 - idx * 8}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={45 - idx * 8}
                    sx={{
                      height: '8px',
                      borderRadius: RADIUS_PRO.full,
                      backgroundColor: THEME_PRO.bgTertiary,
                      '& .MuiLinearProgress-bar': {
                        background: [THEME_PRO.gradientPrimary, THEME_PRO.gradientSuccess, THEME_PRO.gradientWarning, THEME_PRO.gradientError][idx],
                        borderRadius: RADIUS_PRO.full,
                      },
                    }}
                  />
                </Box>
              ))}
            </Card>
          </Box>

          <Box>
            <Card
              sx={{
                p: SPACING_PRO.xxl,
                borderRadius: RADIUS_PRO.lg,
                border: `1px solid ${THEME_PRO.border}`,
                background: THEME_PRO.gradientPrimary,
              }}
            >
              <Typography
                sx={{ fontSize: '14px', fontWeight: 600, color: THEME_PRO.textInverse, opacity: 0.8, mb: SPACING_PRO.md }}
              >
                Account Balance
              </Typography>
              <Typography sx={{ fontSize: '32px', fontWeight: 700, color: THEME_PRO.textInverse, mb: SPACING_PRO.lg }}>
                {showValues ? formatCurrency(accountBalance, currency) : '••••••'}
              </Typography>
              <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
                <Button
                  onClick={() => setDepositOpen(true)}
                  variant="contained"
                  sx={{
                    flex: 1,
                    backgroundColor: THEME_PRO.textInverse,
                    color: THEME_PRO.primary,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: THEME_PRO.bgPrimary },
                  }}
                >
                  Deposit
                </Button>
                <Button
                  onClick={() => setWithdrawalOpen(true)}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderColor: THEME_PRO.textInverse,
                    color: THEME_PRO.textInverse,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Withdraw
                </Button>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Charts Section */}
        <Box sx={{ mt: SPACING_PRO.xxxl }}>
          <Typography variant="h5" sx={{ fontSize: '22px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
            📊 Performance Analytics
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: SPACING_PRO.xxxl }}>
            {/* Portfolio Value Chart */}
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Portfolio Value Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME_PRO.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={THEME_PRO.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME_PRO.border} />
                  <XAxis dataKey="date" stroke={THEME_PRO.textSecondary} />
                  <YAxis stroke={THEME_PRO.textSecondary} />
                  <Tooltip contentStyle={{ backgroundColor: THEME_PRO.bgSecondary, border: `1px solid ${THEME_PRO.border}` }} />
                  <Area type="monotone" dataKey="value" stroke={THEME_PRO.primary} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Daily Returns Chart */}
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Daily Returns (%)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyReturnsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME_PRO.border} />
                  <XAxis dataKey="time" stroke={THEME_PRO.textSecondary} />
                  <YAxis stroke={THEME_PRO.textSecondary} />
                  <Tooltip contentStyle={{ backgroundColor: THEME_PRO.bgSecondary, border: `1px solid ${THEME_PRO.border}` }} />
                  <Bar dataKey="return" fill={THEME_PRO.success} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Strategy Performance */}
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Strategy Allocation
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={strategyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {strategyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: THEME_PRO.bgSecondary, border: `1px solid ${THEME_PRO.border}` }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Win Rate Chart */}
            <Card sx={{ p: SPACING_PRO.xxl, borderRadius: RADIUS_PRO.lg, border: `1px solid ${THEME_PRO.border}` }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: THEME_PRO.textPrimary, mb: SPACING_PRO.lg }}>
                Weekly Win Rate
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { week: 'Week 1', wins: 65 },
                  { week: 'Week 2', wins: 70 },
                  { week: 'Week 3', wins: 68 },
                  { week: 'Week 4', wins: 74 },
                  { week: 'Week 5', wins: 72 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME_PRO.border} />
                  <XAxis dataKey="week" stroke={THEME_PRO.textSecondary} />
                  <YAxis stroke={THEME_PRO.textSecondary} />
                  <Tooltip contentStyle={{ backgroundColor: THEME_PRO.bgSecondary, border: `1px solid ${THEME_PRO.border}` }} />
                  <Line type="monotone" dataKey="wins" stroke={THEME_PRO.primary} strokeWidth={2} dot={{ fill: THEME_PRO.primary, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Withdrawal Dialog */}
      <Dialog
        open={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: RADIUS_PRO.lg,
              backgroundColor: THEME_PRO.bgSecondary,
              border: `1px solid ${THEME_PRO.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>
          💸 Withdrawal Request
        </DialogTitle>
        <DialogContent sx={{ pt: SPACING_PRO.lg }}>
          {withdrawalMessage && (
            <Alert
              sx={{
                mb: SPACING_PRO.lg,
                backgroundColor: withdrawalMessage.includes('✅') ? THEME_PRO.successLight : THEME_PRO.errorLight,
                color: withdrawalMessage.includes('✅') ? THEME_PRO.success : THEME_PRO.error,
                border: `1px solid ${withdrawalMessage.includes('✅') ? THEME_PRO.success : THEME_PRO.error}`,
              }}
            >
              {withdrawalMessage}
            </Alert>
          )}

          <Typography sx={{ color: THEME_PRO.textSecondary, fontSize: '13px', mb: SPACING_PRO.md }}>
            Available Balance: {formatCurrency(287450, currency)}
          </Typography>

          <TextField
            fullWidth
            label="Withdrawal Amount"
            type="number"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            placeholder="Enter amount"
            inputProps={{ step: '0.01', min: '0' }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME_PRO.bgTertiary,
                color: THEME_PRO.textPrimary,
                '& fieldset': { borderColor: THEME_PRO.border },
                '&:hover fieldset': { borderColor: THEME_PRO.primary },
              },
              '& .MuiInputBase-input': {
                color: THEME_PRO.textPrimary,
              },
              '& .MuiInputLabel-root': {
                color: THEME_PRO.textSecondary,
              },
            }}
          />

          <Box sx={{ mt: SPACING_PRO.lg, p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
            <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.sm }}>
              📋 Withdrawal Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.sm }}>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary }}>Amount:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: THEME_PRO.primary }}>
                {withdrawalAmount ? formatCurrency(parseFloat(withdrawalAmount), currency) : '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary }}>Remaining Balance:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: THEME_PRO.primary }}>
                {withdrawalAmount ? formatCurrency(287450 - parseFloat(withdrawalAmount), currency) : formatCurrency(287450, currency)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: SPACING_PRO.lg, gap: SPACING_PRO.sm }}>
          <Button
            onClick={() => setWithdrawalOpen(false)}
            sx={{ color: THEME_PRO.textSecondary, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdrawal}
            variant="contained"
            sx={{
              backgroundColor: THEME_PRO.primary,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: THEME_PRO.primaryDark },
            }}
          >
            Confirm Withdrawal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: RADIUS_PRO.lg,
              backgroundColor: THEME_PRO.bgSecondary,
              border: `1px solid ${THEME_PRO.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ color: THEME_PRO.textPrimary, fontWeight: 700 }}>
          💰 Deposit Funds
        </DialogTitle>
        <DialogContent sx={{ pt: SPACING_PRO.lg }}>
          {depositMessage && (
            <Alert
              sx={{
                mb: SPACING_PRO.lg,
                backgroundColor: depositMessage.includes('✅') ? THEME_PRO.successLight : THEME_PRO.errorLight,
                color: depositMessage.includes('✅') ? THEME_PRO.success : THEME_PRO.error,
                border: `1px solid ${depositMessage.includes('✅') ? THEME_PRO.success : THEME_PRO.error}`,
              }}
            >
              {depositMessage}
            </Alert>
          )}

          <Typography sx={{ color: THEME_PRO.textSecondary, fontSize: '13px', mb: SPACING_PRO.md }}>
            Deposit funds to your trading account using various payment methods
          </Typography>

          <TextField
            fullWidth
            label="Deposit Amount"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount"
            inputProps={{ step: '0.01', min: '0' }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME_PRO.bgTertiary,
                color: THEME_PRO.textPrimary,
                '& fieldset': { borderColor: THEME_PRO.border },
                '&:hover fieldset': { borderColor: THEME_PRO.primary },
              },
              '& .MuiInputBase-input': {
                color: THEME_PRO.textPrimary,
              },
              '& .MuiInputLabel-root': {
                color: THEME_PRO.textSecondary,
              },
            }}
          />

          <Box sx={{ mt: SPACING_PRO.lg, p: SPACING_PRO.lg, backgroundColor: THEME_PRO.bgTertiary, borderRadius: RADIUS_PRO.md }}>
            <Typography sx={{ fontSize: '12px', color: THEME_PRO.textSecondary, mb: SPACING_PRO.sm }}>
              📋 Deposit Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.sm }}>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary }}>Current Balance:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: THEME_PRO.primary }}>
                {formatCurrency(accountBalance, currency)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: SPACING_PRO.sm }}>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary }}>Deposit Amount:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: THEME_PRO.success }}>
                +{depositAmount ? formatCurrency(parseFloat(depositAmount), currency) : '—'}
              </Typography>
            </Box>
            <Box sx={{ borderTop: `1px solid ${THEME_PRO.border}`, pt: SPACING_PRO.sm, display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '13px', color: THEME_PRO.textSecondary, fontWeight: 600 }}>New Balance:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: THEME_PRO.primary }}>
                {depositAmount ? formatCurrency(accountBalance + parseFloat(depositAmount), currency) : formatCurrency(accountBalance, currency)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: SPACING_PRO.lg, gap: SPACING_PRO.sm }}>
          <Button
            onClick={() => setDepositOpen(false)}
            sx={{ color: THEME_PRO.textSecondary, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            sx={{
              backgroundColor: THEME_PRO.success,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#059669' },
            }}
          >
            Confirm Deposit
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutPro>
  )
}
