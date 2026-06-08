import React from 'react'
import { LayoutPro } from '../components/LayoutPro'
import { Box, Card, Typography, LinearProgress, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material'
import { TrendingUp, TrendingDown, Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuthStore } from '../state/store'
import { formatCurrency, getCurrencyByCode } from '../content/currencies'
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
  const [withdrawalAmount, setWithdrawalAmount] = React.useState('')
  const [withdrawalMessage, setWithdrawalMessage] = React.useState('')
  const { currency } = useAuthStore()
  const currencyInfo = getCurrencyByCode(currency)

  const handleWithdrawal = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setWithdrawalMessage('❌ Please enter a valid amount')
      return
    }

    const amount = parseFloat(withdrawalAmount)
    if (amount > 287450) {
      setWithdrawalMessage('❌ Insufficient balance for this withdrawal')
      return
    }

    setWithdrawalMessage(`✅ Withdrawal request of ${formatCurrency(amount, currency)} submitted! Processing...`)
    setTimeout(() => {
      setWithdrawalOpen(false)
      setWithdrawalAmount('')
      setWithdrawalMessage('')
    }, 3000)
  }

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
                {showValues ? formatCurrency(287450, currency) : '••••••'}
              </Typography>
              <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
                <Button
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
    </LayoutPro>
  )
}
