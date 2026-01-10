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

// ===== SHARED BUDGETS TYPES =====

export type SplittingMethod = 'equal' | 'custom' | 'itemized';
export type MemberRole = 'admin' | 'member';
export type MemberStatus = 'active' | 'invited' | 'left';
export type SettlementStatus = 'pending' | 'completed';

// Shared Budget (main budget document)
export interface SharedBudget {
  id: string;
  createdBy: string;                    // User ID of creator/admin
  name: string;
  description?: string;
  category: string;

  // Budget Details
  totalBudget: number;
  currency: string;
  period: 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;

  // Members map
  members: Record<
    string,
    {
      status: MemberStatus;
      joinedAt: Date;
      role: MemberRole;
      splitPercentage?: number;
    }
  >;

  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shared Expense (belongs to shared budget)
export interface SharedExpense {
  id: string;
  budgetId: string;

  // Expense Details
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;

  // Payment Info
  paidBy: string;
  paidByAmount: number;

  // Splits per member
  splits: Record<
    string,
    {
      amount: number;
      itemized?: Array<{
        description: string;
        amount: number;
        quantity?: number;
      }>;
    }
  >;

  // Receipt
  receiptUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Settlement (payment between members)
export interface Settlement {
  id: string;
  budgetId: string;

  // Payment Details
  from: string;
  to: string;
  amount: number;
  currency: string;

  // Status
  status: SettlementStatus;
  relatedExpenseId?: string;

  // Metadata
  createdAt: Date;
  completedAt?: Date;
  note?: string;
}

// Shared Budget Invite
export interface SharedBudgetInvite {
  id: string;
  budgetId: string;
  invitedBy: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

// Balance Summary (for display)
export interface BalanceSummary {
  [userId: string]: {
    owes: number;                       // Total amount this person owes
    owed: number;                       // Total amount owed to this person
    balance: number;                    // Net balance (owed - owes). Positive = owed to them
  };
}

// Shared Expense Create Input (form data)
export interface SharedExpenseCreate {
  description: string;
  amount: number;
  category: string;
  date: Date;
  paidBy: string;
  splittingMethod: SplittingMethod;
  participants: string[];               // User IDs involved in split
  splits?: Record<string, number>;       // Custom amounts per user
  itemizedSplits?: Record<
    string,
    Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>
  >;
  receiptUrl?: string;
}

// Shared Budget Create Input (form data)
export interface SharedBudgetCreate {
  name: string;
  description?: string;
  category: string;
  totalBudget: number;
  currency: string;
  period: 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;
  inviteEmails?: string[];              // Emails to invite
}
