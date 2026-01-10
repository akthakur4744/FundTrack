import { z } from 'zod';

// ===== ENUM SCHEMAS =====

export const splittingMethodSchema = z.enum(['equal', 'custom', 'itemized']);
export const memberRoleSchema = z.enum(['admin', 'member']);
export const memberStatusSchema = z.enum(['active', 'invited', 'left']);
export const settlementStatusSchema = z.enum(['pending', 'completed']);

// ===== SHARED EXPENSE SCHEMAS =====

const itemizedItemSchema = z.object({
  description: z.string().min(1, 'Item description required').max(100),
  amount: z.number().positive('Item amount must be positive'),
  quantity: z.number().int().positive().optional(),
});

export const baseSharedExpenseSchema = z.object({
  description: z.string().min(1, 'Description required').max(200),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category required'),
  date: z.date(),
  paidBy: z.string().min(1, 'Payer required'),
  splittingMethod: splittingMethodSchema,
  participants: z.string().array().min(1, 'At least one participant required'),
  splits: z.record(z.string(), z.number()).optional(),
  itemizedSplits: z
    .record(z.string(), itemizedItemSchema.array())
    .optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
});

// Validate splits based on splitting method
export const sharedExpenseCreateSchema = baseSharedExpenseSchema
  .refine(
    (data) => {
      // Participants must include paidBy
      return data.participants.includes(data.paidBy);
    },
    {
      message: 'Payer must be included in participants',
      path: ['paidBy'],
    }
  )
  .refine(
    (data) => {
      if (data.splittingMethod === 'equal') {
        // Equal split: divide amount by number of participants
        return true;
      }

      if (data.splittingMethod === 'custom') {
        // Custom split: splits must exist and sum to amount
        if (!data.splits || Object.keys(data.splits).length === 0) {
          return false;
        }

        const totalSplit = Object.values(data.splits).reduce(
          (sum, amount) => sum + amount,
          0
        );

        // Allow 1 cent tolerance for floating point errors
        return Math.abs(totalSplit - data.amount) < 0.01;
      }

      if (data.splittingMethod === 'itemized') {
        // Itemized split: itemizedSplits must exist and sum to amount
        if (!data.itemizedSplits || Object.keys(data.itemizedSplits).length === 0) {
          return false;
        }

        const totalSplit = Object.values(data.itemizedSplits)
          .flat()
          .reduce((sum, item) => {
            const itemTotal = item.amount * (item.quantity || 1);
            return sum + itemTotal;
          }, 0);

        return Math.abs(totalSplit - data.amount) < 0.01;
      }

      return true;
    },
    {
      message: 'Split amounts must sum to total expense amount',
      path: ['splits'],
    }
  );

// Update schema with partial fields (built from base schema before refinement)
export const sharedExpenseUpdateSchema = baseSharedExpenseSchema
  .partial()
  .refine(
    (data) => {
      // Only validate if paidBy and participants are both provided
      if (data.paidBy && data.participants) {
        return data.participants.includes(data.paidBy);
      }
      return true;
    },
    {
      message: 'Payer must be included in participants',
      path: ['paidBy'],
    }
  );

// ===== SHARED BUDGET SCHEMAS =====

export const baseSharedBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Category required'),
  totalBudget: z.number().positive('Budget amount must be greater than 0'),
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  period: z.enum(['monthly', 'custom']),
  startDate: z.date(),
  endDate: z.date().optional(),
  inviteEmails: z.string().email().array().optional(),
});

export const sharedBudgetCreateSchema = baseSharedBudgetSchema
  .refine(
    (data) => {
      if (data.period === 'custom' && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date required for custom period',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

// Update schema with partial fields (exclude inviteEmails for updates)
export const sharedBudgetUpdateSchema = baseSharedBudgetSchema
  .omit({ inviteEmails: true })
  .partial()
  .refine(
    (data) => {
      if (data.period === 'custom' && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date required for custom period',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

// ===== INVITATION SCHEMAS =====

export const sharedBudgetInviteSchema = z.object({
  invitedEmail: z.string().email('Valid email required'),
});

// ===== SETTLEMENT SCHEMAS =====

export const recordSettlementSchema = z.object({
  from: z.string().min(1, 'Payer required'),
  to: z.string().min(1, 'Payee required'),
  amount: z.number().positive('Settlement amount must be positive'),
  note: z.string().max(200).optional(),
});

// ===== UTILITY TYPES & FUNCTIONS =====

export type SharedExpenseCreate = z.infer<typeof sharedExpenseCreateSchema>;
export type SharedExpenseUpdate = z.infer<typeof sharedExpenseUpdateSchema>;
export type SharedBudgetCreate = z.infer<typeof sharedBudgetCreateSchema>;
export type SharedBudgetUpdate = z.infer<typeof sharedBudgetUpdateSchema>;
export type RecordSettlement = z.infer<typeof recordSettlementSchema>;

// Splitting method labels
export const SPLITTING_METHOD_LABELS: Record<string, string> = {
  equal: 'Split Equally',
  custom: 'Custom Amounts',
  itemized: 'Itemized (By Item)',
};

export const SPLITTING_METHOD_DESCRIPTIONS: Record<string, string> = {
  equal: 'Divide amount equally among all participants',
  custom: 'Specify exact amount each person owes',
  itemized: 'Assign items to each person by amount',
};

// Member role labels
export const MEMBER_ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Can manage budget, expenses, and members',
  member: 'Can view budget and add expenses',
};

// Member status labels
export const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  invited: 'Pending Invite',
  left: 'Left',
};

// Utility function to format splitting method display
export function getSplittingMethodLabel(method: string): string {
  return SPLITTING_METHOD_LABELS[method] || method;
}

// Utility function to get member status label
export function getMemberStatusLabel(status: string): string {
  return MEMBER_STATUS_LABELS[status] || status;
}

// Utility function to get member role label
export function getMemberRoleLabel(role: string): string {
  return MEMBER_ROLE_LABELS[role] || role;
}

// Utility function to calculate equal split amount
export function calculateEqualSplit(
  totalAmount: number,
  participantCount: number
): number {
  return Math.round((totalAmount / participantCount) * 100) / 100;
}

// Utility function to validate all splits sum to total
export function validateSplitsSum(
  splits: Record<string, number>,
  total: number,
  tolerance: number = 0.01
): boolean {
  const sum = Object.values(splits).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - total) < tolerance;
}

// Utility function to validate itemized splits sum to total
export function validateItemizedSplitsSum(
  itemizedSplits: Record<string, Array<{ amount: number; quantity?: number }>>,
  total: number,
  tolerance: number = 0.01
): boolean {
  const sum = Object.values(itemizedSplits)
    .flat()
    .reduce((acc, item) => {
      const itemTotal = item.amount * (item.quantity || 1);
      return acc + itemTotal;
    }, 0);
  return Math.abs(sum - total) < tolerance;
}
