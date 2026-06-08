export interface Currency {
  code: string
  name: string
  symbol: string
  country: string
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'Eurozone' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', country: 'Mexico' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa' },
]

export const DEFAULT_CURRENCY: Currency = { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' }

export const getCurrencyByCode = (code: string): Currency => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || DEFAULT_CURRENCY
}

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode)

  // Format number with 2 decimal places
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Return formatted with symbol
  return `${currency.symbol}${formatted}`
}

export const formatCurrencyShort = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode)

  // Format large numbers with K, M, B
  let displayAmount = amount
  let suffix = ''

  if (Math.abs(amount) >= 1000000000) {
    displayAmount = amount / 1000000000
    suffix = 'B'
  } else if (Math.abs(amount) >= 1000000) {
    displayAmount = amount / 1000000
    suffix = 'M'
  } else if (Math.abs(amount) >= 1000) {
    displayAmount = amount / 1000
    suffix = 'K'
  }

  const formatted = displayAmount.toLocaleString('en-US', {
    minimumFractionDigits: suffix ? 1 : 2,
    maximumFractionDigits: suffix ? 1 : 2,
  })

  return `${currency.symbol}${formatted}${suffix}`
}
