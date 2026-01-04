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
