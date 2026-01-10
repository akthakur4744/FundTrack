// Frequency enum for recurring expenses
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Expense type
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date;
  paymentMethod: string;
  tags?: string[];
  receiptUrl?: string;
  synced: boolean;
  // NEW: Link to recurring expense
  recurringExpenseId?: string;
  isRecurringInstance?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Recurring Expense type
export interface RecurringExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  frequency: Frequency;
  startDate: Date;
  endDate?: Date;
  // Week-specific: days of week (0 = Sunday, 6 = Saturday)
  daysOfWeek?: number[];
  // Month-specific: day of month (1-31)
  dayOfMonth?: number;
  // Metadata
  isActive: boolean;
  nextInstanceDue: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Budget type
export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  alertThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User type
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    currency: string;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category type
export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

// Transaction type (for reports)
export interface Transaction {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: Date;
  expenseRef?: string; // Reference to expense doc
}
