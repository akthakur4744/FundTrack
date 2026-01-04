import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  getExpensesByDateRange,
  getExpensesByCategory,
  addExpense,
  updateExpense,
  deleteExpense,
  getTotalSpending,
  getSpendingByCategory,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from '../services/expenses';

const EXPENSES_QUERY_KEY = 'expenses';

/**
 * Query hook for fetching all expenses
 */
export const useExpenses = (userId: string | null) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, userId],
    queryFn: () => (userId ? getExpenses(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Query hook for fetching expenses in a date range
 */
export const useExpensesByDateRange = (
  userId: string | null,
  startDate: number,
  endDate: number
) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, userId, 'dateRange', startDate, endDate],
    queryFn: () =>
      userId ? getExpensesByDateRange(userId, startDate, endDate) : Promise.resolve([]),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Query hook for fetching expenses by category
 */
export const useExpensesByCategory = (userId: string | null, category: string) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, userId, 'category', category],
    queryFn: () => (userId ? getExpensesByCategory(userId, category) : Promise.resolve([])),
    enabled: !!userId && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Query hook for total spending
 */
export const useTotalSpending = (userId: string | null, startDate: number, endDate: number) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, userId, 'total', startDate, endDate],
    queryFn: () =>
      userId ? getTotalSpending(userId, startDate, endDate) : Promise.resolve(0),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Query hook for spending by category
 */
export const useSpendingByCategory = (
  userId: string | null,
  startDate: number,
  endDate: number
) => {
  return useQuery({
    queryKey: [EXPENSES_QUERY_KEY, userId, 'byCategory', startDate, endDate],
    queryFn: () =>
      userId ? getSpendingByCategory(userId, startDate, endDate) : Promise.resolve({}),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Mutation hook for adding a new expense
 */
export const useAddExpense = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: CreateExpenseInput) => addExpense(userId, expenseData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for updating an expense
 */
export const useUpdateExpense = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, updates }: { expenseId: string; updates: UpdateExpenseInput }) =>
      updateExpense(userId, expenseId, updates),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for deleting an expense
 */
export const useDeleteExpense = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(userId, expenseId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, userId] });
    },
  });
};
