import { z } from 'zod';

// Expense validation schema
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.date(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  tags: z.array(z.string()).optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

// Budget validation schema
export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  period: z.enum(['monthly', 'yearly']),
  alertThreshold: z.number().min(0).max(100).default(80),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  currency: z.string().default('USD'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().default('en'),
  notifications: z.boolean().default(true),
  timezone: z.string().default('UTC'),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Export shared budget schemas and utilities
export {
  splittingMethodSchema,
  memberRoleSchema,
  memberStatusSchema,
  settlementStatusSchema,
  baseSharedExpenseSchema,
  sharedExpenseCreateSchema,
  sharedExpenseUpdateSchema,
  baseSharedBudgetSchema,
  sharedBudgetCreateSchema,
  sharedBudgetUpdateSchema,
  sharedBudgetInviteSchema,
  recordSettlementSchema,
  type SharedExpenseCreate,
  type SharedExpenseUpdate,
  type SharedBudgetCreate,
  type SharedBudgetUpdate,
  type RecordSettlement,
  SPLITTING_METHOD_LABELS,
  SPLITTING_METHOD_DESCRIPTIONS,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_DESCRIPTIONS,
  MEMBER_STATUS_LABELS,
  getSplittingMethodLabel,
  getMemberStatusLabel,
  getMemberRoleLabel,
  calculateEqualSplit,
  validateSplitsSum,
  validateItemizedSplitsSum,
} from './sharedBudgetSchema';
