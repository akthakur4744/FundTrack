import { z } from 'zod';

// Frequency validation
export const frequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

/**
 * Base recurring expense schema (without refinements)
 */
const baseRecurringExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.number().positive('Amount must be greater than 0').finite(),
  currency: z.string().default('USD'),
  category: z.string().min(1, 'Category is required'),
  frequency: frequencySchema,
  startDate: z.date(),
  endDate: z.date().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
});

/**
 * Schema for creating a new recurring expense
 * Validates:
 * - Required fields: description, amount, category, frequency, startDate
 * - Optional fields: endDate, daysOfWeek (for weekly), dayOfMonth (for monthly)
 * - Amount must be positive
 * - Dates must be valid and in correct order
 */
export const recurringExpenseCreateSchema = baseRecurringExpenseSchema.refine(
  // Validate that if frequency is 'weekly', daysOfWeek is provided
  (data) => data.frequency !== 'weekly' || (data.daysOfWeek && data.daysOfWeek.length > 0),
  {
    message: 'Days of week required for weekly recurrence',
    path: ['daysOfWeek'],
  }
).refine(
  // Validate that if frequency is 'monthly', dayOfMonth is provided
  (data) => data.frequency !== 'monthly' || data.dayOfMonth !== undefined,
  {
    message: 'Day of month required for monthly recurrence',
    path: ['dayOfMonth'],
  }
).refine(
  // Validate that endDate is after startDate if provided
  (data) => !data.endDate || data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type RecurringExpenseCreate = z.infer<typeof recurringExpenseCreateSchema>;

/**
 * Schema for updating a recurring expense
 * All fields optional (partial update)
 */
export const recurringExpenseUpdateSchema = baseRecurringExpenseSchema.partial();

export type RecurringExpenseUpdate = z.infer<typeof recurringExpenseUpdateSchema>;

/**
 * Frequency constants for UI
 */
export const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export const FREQUENCY_DESCRIPTIONS: Record<string, string> = {
  daily: 'Every day',
  weekly: 'Every week on selected days',
  monthly: 'Every month on selected day',
  yearly: 'Every year on same date',
};

/**
 * Day of week constants for weekly recurrence
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

/**
 * Utility function to get label for frequency
 */
export function getFrequencyLabel(frequency: string): string {
  return FREQUENCY_LABELS[frequency] || frequency;
}

/**
 * Utility function to get description for frequency
 */
export function getFrequencyDescription(frequency: string): string {
  return FREQUENCY_DESCRIPTIONS[frequency] || '';
}

/**
 * Utility function to format days of week for display
 */
export function formatDaysOfWeek(days: number[]): string {
  if (!days || days.length === 0) return '';
  const labels = days.map(d => DAYS_OF_WEEK[d]?.label || '').filter(Boolean);
  return labels.join(', ');
}
