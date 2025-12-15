// Currency formatting utility
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

// Date formatting utility
export const formatDate = (date: Date, format: string = 'MMM dd, yyyy'): string => {
  // This will be replaced with date-fns formatting
  return date.toLocaleDateString();
};

// Number formatting utility
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

// Percentage formatting utility
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`;
};
