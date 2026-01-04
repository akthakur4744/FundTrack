import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBudgets,
  getBudgetByCategory,
  isBudgetExceeded,
  getBudgetProgress,
  addBudget,
  updateBudget,
  deleteBudget,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from '../services/budgets';

const BUDGETS_QUERY_KEY = 'budgets';

/**
 * Query hook for fetching all budgets
 */
export const useBudgets = (userId: string | null) => {
  return useQuery({
    queryKey: [BUDGETS_QUERY_KEY, userId],
    queryFn: () => (userId ? getBudgets(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Query hook for fetching budget by category
 */
export const useBudgetByCategory = (userId: string | null, category: string) => {
  return useQuery({
    queryKey: [BUDGETS_QUERY_KEY, userId, 'category', category],
    queryFn: () => (userId ? getBudgetByCategory(userId, category) : Promise.resolve(null)),
    enabled: !!userId && !!category,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Query hook to check if budget exceeded
 */
export const useIsBudgetExceeded = (
  userId: string | null,
  category: string,
  currentSpending: number
) => {
  return useQuery({
    queryKey: [BUDGETS_QUERY_KEY, userId, 'exceeded', category, currentSpending],
    queryFn: () =>
      userId ? isBudgetExceeded(userId, category, currentSpending) : Promise.resolve(false),
    enabled: !!userId && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Query hook for budget progress
 */
export const useBudgetProgress = (
  userId: string | null,
  category: string,
  currentSpending: number
) => {
  return useQuery({
    queryKey: [BUDGETS_QUERY_KEY, userId, 'progress', category, currentSpending],
    queryFn: () =>
      userId
        ? getBudgetProgress(userId, category, currentSpending)
        : Promise.resolve({ spent: 0, limit: 0, percentage: 0, remaining: 0 }),
    enabled: !!userId && !!category,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Mutation hook for adding a new budget
 */
export const useAddBudget = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetData: CreateBudgetInput) => addBudget(userId, budgetData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for updating a budget
 */
export const useUpdateBudget = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, updates }: { budgetId: string; updates: UpdateBudgetInput }) =>
      updateBudget(userId, budgetId, updates),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for deleting a budget
 */
export const useDeleteBudget = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) => deleteBudget(userId, budgetId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, userId] });
    },
  });
};
