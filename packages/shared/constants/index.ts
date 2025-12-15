// Default categories
export const DEFAULT_CATEGORIES = {
  FOOD: { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  TRANSPORT: {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: '#4ECDC4',
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎥',
    color: '#FFE66D',
  },
  HOME: { id: 'home', name: 'Home & Utilities', icon: '🏠', color: '#95E1D3' },
  WORK: { id: 'work', name: 'Work', icon: '💼', color: '#A8D8EA' },
  HEALTH: { id: 'health', name: 'Health & Fitness', icon: '💪', color: '#AA96DA' },
  SHOPPING: { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#FCBAD3' },
  OTHER: { id: 'other', name: 'Other', icon: '📌', color: '#CCCCCC' },
} as const;

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash' },
  { id: 'credit_card', name: 'Credit Card' },
  { id: 'debit_card', name: 'Debit Card' },
  { id: 'bank_transfer', name: 'Bank Transfer' },
  { id: 'wallet', name: 'Digital Wallet' },
  { id: 'upi', name: 'UPI' },
  { id: 'other', name: 'Other' },
] as const;

// Theme options
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// Language options
export const LANGUAGE_OPTIONS = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  JA: 'ja',
  ZH: 'zh',
} as const;
