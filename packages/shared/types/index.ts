import { z } from 'zod';

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
