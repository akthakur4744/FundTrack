import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  createSharedBudget,
  getSharedBudgets,
  getSharedBudgetById,
  updateSharedBudget,
  deleteSharedBudget,
  inviteMembers,
  acceptInvite,
  removeMember,
  getMembers,
  addSharedExpense,
  updateSharedExpense,
  deleteSharedExpense,
  getSharedExpenses,
  getSharedExpensesByMember,
  calculateBalances,
  calculateSettlements,
  recordSettlement,
  getSettlementHistory,
} from '../services/sharedBudgets';
import {
  SharedBudgetCreate,
  SharedBudgetUpdate,
  SharedExpenseCreate,
} from '@fundtrack/shared/schemas';

// ===== SHARED BUDGET HOOKS =====

/**
 * Create a new shared budget
 */
export function useCreateSharedBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SharedBudgetCreate) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return createSharedBudget(user.uid, data);
    },
    onSuccess: () => {
      // Invalidate shared budgets list
      queryClient.invalidateQueries({
        queryKey: ['sharedBudgets', user?.uid],
      });
    },
  });
}

/**
 * Get all shared budgets for user
 */
export function useSharedBudgets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sharedBudgets', user?.uid],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getSharedBudgets(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific shared budget
 */
export function useSharedBudgetById(budgetId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sharedBudget', user?.uid, budgetId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getSharedBudgetById(user.uid, budgetId);
    },
    enabled: !!user?.uid && !!budgetId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update a shared budget
 */
export function useUpdateSharedBudget(budgetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SharedBudgetUpdate) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return updateSharedBudget(user.uid, budgetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedBudget', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['sharedBudgets', user?.uid],
      });
    },
  });
}

/**
 * Delete a shared budget
 */
export function useDeleteSharedBudget(budgetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return deleteSharedBudget(user.uid, budgetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedBudgets', user?.uid],
      });
    },
  });
}

// ===== MEMBER MANAGEMENT HOOKS =====

/**
 * Get members of a shared budget
 */
export function useSharedBudgetMembers(budgetId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sharedBudgetMembers', user?.uid, budgetId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getMembers(user.uid, budgetId);
    },
    enabled: !!user?.uid && !!budgetId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Invite members to a shared budget
 */
export function useInviteMembers(budgetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emails: string[]) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return inviteMembers(budgetId, user.uid, emails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedBudget', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['sharedBudgetMembers', user?.uid, budgetId],
      });
    },
  });
}

/**
 * Accept an invitation to a shared budget
 */
export function useAcceptInvite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, email }: { budgetId: string; email: string }) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return acceptInvite(user.uid, budgetId, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedBudgets', user?.uid],
      });
    },
  });
}

/**
 * Remove a member from a shared budget
 */
export function useRemoveMember(budgetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return removeMember(user.uid, budgetId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedBudgetMembers', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['sharedBudget', user?.uid, budgetId],
      });
    },
  });
}

// ===== SHARED EXPENSE HOOKS =====

/**
 * Get all shared expenses in a budget
 */
export function useSharedExpenses(budgetId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sharedExpenses', user?.uid, budgetId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getSharedExpenses(user.uid, budgetId);
    },
    enabled: !!user?.uid && !!budgetId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates)
  });
}

/**
 * Get shared expenses involving a specific member
 */
export function useSharedExpensesByMember(budgetId: string, memberId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sharedExpensesByMember', user?.uid, budgetId, memberId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getSharedExpensesByMember(user.uid, budgetId, memberId);
    },
    enabled: !!user?.uid && !!budgetId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Add a shared expense
 */
export function useAddSharedExpense(budgetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SharedExpenseCreate) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return addSharedExpense(user.uid, budgetId, data);
    },
    onSuccess: () => {
      // Invalidate expenses and balances
      queryClient.invalidateQueries({
        queryKey: ['sharedExpenses', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['balances', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['settlements', user?.uid, budgetId],
      });
    },
  });
}

/**
 * Update a shared expense
 */
export function useUpdateSharedExpense(budgetId: string, expenseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SharedExpenseCreate>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return updateSharedExpense(user.uid, budgetId, expenseId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedExpenses', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['balances', user?.uid, budgetId],
      });
    },
  });
}

/**
 * Delete a shared expense
 */
export function useDeleteSharedExpense(budgetId: string, expenseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return deleteSharedExpense(user.uid, budgetId, expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharedExpenses', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['balances', user?.uid, budgetId],
      });
    },
  });
}

// ===== BALANCE & SETTLEMENT HOOKS =====

/**
 * Get balance summary for a shared budget
 */
export function useBalances(budgetId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['balances', user?.uid, budgetId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return calculateBalances(user.uid, budgetId);
    },
    enabled: !!user?.uid && !!budgetId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get settlement suggestions
 */
export function useSettlementSuggestions(budgetId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['settlementSuggestions', user?.uid, budgetId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return calculateSettlements(user.uid, budgetId);
    },
    enabled: !!user?.uid && !!budgetId,
    staleTime: 5 * 60 * 1000, // Recalculate less frequently
  });
}

/**
 * Get settlement history
 */
export function useSettlementHistory(budgetId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['settlements', user?.uid, budgetId],
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getSettlementHistory(user.uid, budgetId);
    },
    enabled: !!user?.uid && !!budgetId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Record a settlement payment
 */
export function useRecordSettlement(budgetId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      from,
      to,
      amount,
      note,
    }: {
      from: string;
      to: string;
      amount: number;
      note?: string;
    }) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return recordSettlement(user.uid, budgetId, from, to, amount, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settlements', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['balances', user?.uid, budgetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['settlementSuggestions', user?.uid, budgetId],
      });
    },
  });
}
