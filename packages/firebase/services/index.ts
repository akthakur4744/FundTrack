// Expenses
export {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  getExpensesByDateRange,
  getExpensesByCategory,
  getTotalSpending,
  getSpendingByCategory,
  type Expense,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from './expenses';

// Budgets
export {
  addBudget,
  updateBudget,
  deleteBudget,
  getBudget,
  getBudgets,
  getBudgetByCategory,
  isBudgetExceeded,
  getBudgetProgress,
  type Budget,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from './budgets';

// Categories
export {
  DEFAULT_CATEGORIES,
  initializeDefaultCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategories,
  getCategoryByName,
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './categories';

// Users
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserCurrency,
  getUserTheme,
  getUserTimezone,
  userProfileExists,
  type UserProfile,
  type UserPreferences,
  type CreateUserProfileInput,
} from './users';
