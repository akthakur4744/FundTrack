import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRecurringExpense,
  getRecurringExpenses,
  getRecurringExpenseById,
  getRecurringInstances,
  deleteRecurringExpense,
  deleteRecurringExpenseHard,
  updateRecurringExpense,
} from '../services/recurring';
import { RecurringExpenseCreate } from '../../shared/schemas/recurringSchema';

/**
 * Hook for creating a new recurring expense
 * Invalidates all recurring-related queries on success
 */
export function useCreateRecurringExpense(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecurringExpenseCreate) => {
      if (!userId) throw new Error('User not authenticated');
      return createRecurringExpense(userId, data);
    },
    onSuccess: () => {
      // Invalidate all recurring queries
      queryClient.invalidateQueries({
        queryKey: ['recurringExpenses', userId],
      });
      // Also invalidate expense queries since we generated new instances
      queryClient.invalidateQueries({
        queryKey: ['expenses', userId],
      });
    },
  });
}

/**
 * Hook for fetching all recurring expenses for a user
 */
export function useRecurringExpenses(userId: string | null) {
  return useQuery({
    queryKey: ['recurringExpenses', userId],
    queryFn: () => {
      if (!userId) return [];
      return getRecurringExpenses(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching a single recurring expense by ID
 */
export function useRecurringExpenseById(userId: string | null, recurringId: string | null) {
  return useQuery({
    queryKey: ['recurringExpense', userId, recurringId],
    queryFn: () => {
      if (!userId || !recurringId) return null;
      return getRecurringExpenseById(userId, recurringId);
    },
    enabled: !!userId && !!recurringId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching all expense instances from a recurring expense
 */
export function useRecurringInstances(userId: string | null, recurringId: string | null) {
  return useQuery({
    queryKey: ['recurringInstances', userId, recurringId],
    queryFn: () => {
      if (!userId || !recurringId) return [];
      return getRecurringInstances(userId, recurringId);
    },
    enabled: !!userId && !!recurringId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for deleting (soft delete) a recurring expense
 */
export function useDeleteRecurringExpense(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return deleteRecurringExpense(userId, recurringId);
    },
    onSuccess: () => {
      // Invalidate recurring queries
      queryClient.invalidateQueries({
        queryKey: ['recurringExpenses', userId],
      });
    },
  });
}

/**
 * Hook for hard deleting a recurring expense and all its instances
 * WARNING: This is destructive and cannot be undone
 */
export function useDeleteRecurringExpenseHard(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return deleteRecurringExpenseHard(userId, recurringId);
    },
    onSuccess: () => {
      // Invalidate all recurring and expense queries
      queryClient.invalidateQueries({
        queryKey: ['recurringExpenses', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['expenses', userId],
      });
    },
  });
}

/**
 * Hook for updating a recurring expense
 * Updates the recurring expense and regenerates future instances
 */
export function useUpdateRecurringExpense(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recurringId,
      updates,
    }: {
      recurringId: string;
      updates: Partial<RecurringExpenseCreate>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return updateRecurringExpense(userId, recurringId, updates);
    },
    onSuccess: () => {
      // Invalidate all recurring queries
      queryClient.invalidateQueries({
        queryKey: ['recurringExpenses', userId],
      });
      // Also invalidate expense queries since we regenerated instances
      queryClient.invalidateQueries({
        queryKey: ['expenses', userId],
      });
    },
  });
}
