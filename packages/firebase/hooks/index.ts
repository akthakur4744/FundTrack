// Auth hooks
export { useAuth, type UseAuthReturn } from './useAuth';

// Expenses hooks
export {
  useExpenses,
  useExpensesByDateRange,
  useExpensesByCategory,
  useTotalSpending,
  useSpendingByCategory,
  useAddExpense,
  useUpdateExpense,
  useDeleteExpense,
} from './useExpenses';

// Budgets hooks
export {
  useBudgets,
  useBudgetByCategory,
  useIsBudgetExceeded,
  useBudgetProgress,
  useAddBudget,
  useUpdateBudget,
  useDeleteBudget,
} from './useBudgets';

// Categories hooks
export {
  useCategories,
  useCategoryByName,
  useInitializeDefaultCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './useCategories';

// Receipt hooks
export {
  useUploadReceipt,
  useReceiptURLs,
  useDeleteReceipt,
} from './useReceipts';

// Recurring Expenses hooks
export {
  useCreateRecurringExpense,
  useRecurringExpenses,
  useRecurringExpenseById,
  useRecurringInstances,
  useDeleteRecurringExpense,
  useDeleteRecurringExpenseHard,
  useUpdateRecurringExpense,
} from './useRecurring';

// Shared Budgets hooks
export {
  useCreateSharedBudget,
  useSharedBudgets,
  useSharedBudgetById,
  useUpdateSharedBudget,
  useDeleteSharedBudget,
  useSharedBudgetMembers,
  useInviteMembers,
  useAcceptInvite,
  useRemoveMember,
  useSharedExpenses,
  useSharedExpensesByMember,
  useAddSharedExpense,
  useUpdateSharedExpense,
  useDeleteSharedExpense,
  useBalances,
  useSettlementSuggestions,
  useSettlementHistory,
  useRecordSettlement,
} from './useSharedBudgets';
