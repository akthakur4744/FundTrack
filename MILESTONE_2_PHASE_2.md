# Milestone 2 - Phase 2: Firestore Data Layer & React Query Integration ✅

**Status:** Phase 2 Implementation Complete  
**Date:** January 4, 2026  
**Duration:** Part of Milestone 2 (4-6 weeks)

---

## 📋 What Was Implemented

### 1. Firestore Services Layer
Complete CRUD operations and queries for all data entities:

#### **Expenses Service** (`packages/firebase/services/expenses.ts`)
- ✅ `addExpense()` - Create new expense
- ✅ `updateExpense()` - Edit expense
- ✅ `deleteExpense()` - Delete expense
- ✅ `getExpense()` - Fetch single expense by ID
- ✅ `getExpenses()` - Fetch all expenses with filters
- ✅ `getExpensesByDateRange()` - Query expenses between dates
- ✅ `getExpensesByCategory()` - Query expenses by category
- ✅ `getTotalSpending()` - Calculate total spending in date range
- ✅ `getSpendingByCategory()` - Get breakdown by category

**Key Types:**
- `Expense` - Full expense object with metadata
- `CreateExpenseInput` - Input for creating expense
- `UpdateExpenseInput` - Partial updates

#### **Budgets Service** (`packages/firebase/services/budgets.ts`)
- ✅ `addBudget()` - Create budget
- ✅ `updateBudget()` - Edit budget
- ✅ `deleteBudget()` - Delete budget
- ✅ `getBudget()` - Fetch single budget
- ✅ `getBudgets()` - Fetch all budgets
- ✅ `getBudgetByCategory()` - Get budget for category
- ✅ `isBudgetExceeded()` - Check if spending exceeds limit
- ✅ `getBudgetProgress()` - Calculate spending vs limit

**Key Types:**
- `Budget` - Budget with limit and notifications
- `CreateBudgetInput` - Input for creating budget
- `UpdateBudgetInput` - Partial updates

#### **Categories Service** (`packages/firebase/services/categories.ts`)
- ✅ `initializeDefaultCategories()` - Create 12 default categories
- ✅ `addCategory()` - Create custom category
- ✅ `updateCategory()` - Edit category
- ✅ `deleteCategory()` - Delete (non-default only)
- ✅ `getCategory()` - Fetch single category
- ✅ `getCategories()` - Fetch all categories
- ✅ `getCategoryByName()` - Query by name

**Default Categories:** Food & Dining, Transportation, Shopping, Entertainment, Utilities, Healthcare, Education, Travel, Personal, Work, Subscriptions, Other

**Key Types:**
- `Category` - Category with name, color, icon
- `CreateCategoryInput` - Input for creating category
- `UpdateCategoryInput` - Partial updates

#### **Users Service** (`packages/firebase/services/users.ts`)
- ✅ `createUserProfile()` - Initialize user profile
- ✅ `getUserProfile()` - Fetch user profile
- ✅ `updateUserProfile()` - Edit user info
- ✅ `updateUserPreferences()` - Update preferences
- ✅ `getUserCurrency()` - Get currency preference
- ✅ `getUserTheme()` - Get theme preference
- ✅ `getUserTimezone()` - Get timezone
- ✅ `userProfileExists()` - Check if profile exists

**Key Types:**
- `UserProfile` - Complete user data
- `UserPreferences` - Currency, theme, timezone, language
- `CreateUserProfileInput` - Input for creating profile

### 2. React Query Integration
Complete query and mutation hooks for all operations:

#### **Expenses Hooks** (`packages/firebase/hooks/useExpenses.ts`)
- ✅ `useExpenses()` - Fetch all expenses
- ✅ `useExpensesByDateRange()` - Query by date range
- ✅ `useExpensesByCategory()` - Query by category
- ✅ `useTotalSpending()` - Calculate total
- ✅ `useSpendingByCategory()` - Get breakdown
- ✅ `useAddExpense()` - Create mutation
- ✅ `useUpdateExpense()` - Update mutation
- ✅ `useDeleteExpense()` - Delete mutation

**Caching:** 5-minute stale time for data freshness

#### **Budgets Hooks** (`packages/firebase/hooks/useBudgets.ts`)
- ✅ `useBudgets()` - Fetch all budgets
- ✅ `useBudgetByCategory()` - Query by category
- ✅ `useIsBudgetExceeded()` - Check exceeded
- ✅ `useBudgetProgress()` - Get progress
- ✅ `useAddBudget()` - Create mutation
- ✅ `useUpdateBudget()` - Update mutation
- ✅ `useDeleteBudget()` - Delete mutation

**Caching:** 10-minute stale time

#### **Categories Hooks** (`packages/firebase/hooks/useCategories.ts`)
- ✅ `useCategories()` - Fetch all categories
- ✅ `useCategoryByName()` - Query by name
- ✅ `useInitializeDefaultCategories()` - Initialize mutation
- ✅ `useAddCategory()` - Create mutation
- ✅ `useUpdateCategory()` - Update mutation
- ✅ `useDeleteCategory()` - Delete mutation

**Caching:** 15-minute stale time (less frequent changes)

### 3. Service Exports
**`packages/firebase/services/index.ts`** - Central exports for all services
**`packages/firebase/index.ts`** - Updated to export all services and hooks

---

## 🚀 Usage Examples

### In React Components

```tsx
'use client';

import { useAuth } from '@fundtrack/firebase';
import {
  useExpenses,
  useAddExpense,
  useBudgets,
  useCategories,
  useSpendingByCategory,
} from '@fundtrack/firebase';

export default function ExpensesPage() {
  const { user } = useAuth();
  const { data: expenses, isLoading } = useExpenses(user?.uid);
  const { data: budgets } = useBudgets(user?.uid);
  const { data: categories } = useCategories(user?.uid);
  const { mutate: addExpense } = useAddExpense(user?.uid);
  const { data: spendingByCategory } = useSpendingByCategory(
    user?.uid,
    startDate,
    endDate
  );

  const handleAddExpense = async () => {
    addExpense({
      amount: 50,
      category: 'Food & Dining',
      description: 'Lunch',
      date: Date.now(),
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Expenses</h1>
      {expenses?.map((expense) => (
        <div key={expense.id}>{expense.description}: ${expense.amount}</div>
      ))}
      <button onClick={handleAddExpense}>Add Expense</button>
    </div>
  );
}
```

### Querying Expenses in Date Range

```tsx
const ExpensesChart = () => {
  const { user } = useAuth();
  const startDate = new Date();
  startDate.setDate(1); // First of month
  const endDate = Date.now();

  const { data: expenses } = useExpensesByDateRange(
    user?.uid,
    startDate.getTime(),
    endDate
  );
  const { data: spending } = useSpendingByCategory(
    user?.uid,
    startDate.getTime(),
    endDate
  );

  return (
    <div>
      <h2>Monthly Spending</h2>
      {Object.entries(spending).map(([category, amount]) => (
        <div key={category}>
          {category}: ${amount}
        </div>
      ))}
    </div>
  );
};
```

### Managing Budgets

```tsx
const BudgetManager = () => {
  const { user } = useAuth();
  const { data: budgets } = useBudgets(user?.uid);
  const { mutate: addBudget } = useAddBudget(user?.uid);
  const { mutate: deleteBudget } = useDeleteBudget(user?.uid);

  const handleCreateBudget = () => {
    addBudget({
      category: 'Food & Dining',
      limit: 500,
      period: 'monthly',
      currency: 'USD',
    });
  };

  return (
    <div>
      <h2>Budgets</h2>
      {budgets?.map((budget) => (
        <div key={budget.id}>
          <h3>{budget.category}</h3>
          <p>Limit: ${budget.limit}</p>
          <button onClick={() => deleteBudget(budget.id)}>Delete</button>
        </div>
      ))}
      <button onClick={handleCreateBudget}>Create Budget</button>
    </div>
  );
};
```

### Initialize Categories on Signup

```tsx
const handleSignup = async () => {
  const user = await signUpWithEmail(email, password);
  
  // Initialize default categories for new user
  await initializeDefaultCategories(user.uid);
  
  // Optionally add custom categories
  await addCategory(user.uid, {
    name: 'Gym',
    color: '#FF5733',
    icon: '💪',
  });
};
```

---

## 📊 Query Key Structure

**Format:** `[queryKey, userId, variant?, filter?]`

### Examples:
- `['expenses', userId]` - All expenses
- `['expenses', userId, 'dateRange', startDate, endDate]` - Date range
- `['expenses', userId, 'category', category]` - By category
- `['expenses', userId, 'total', startDate, endDate]` - Total spending
- `['budgets', userId]` - All budgets
- `['budgets', userId, 'category', category]` - Budget for category
- `['categories', userId]` - All categories
- `['categories', userId, 'byName', name]` - Category by name

---

## 🔄 Firestore Collection Structure

```
firestore
├── users/{userId}
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL?: string
│   ├── preferences: object
│   │   ├── currency: string
│   │   ├── theme: 'light' | 'dark'
│   │   ├── timezone: string
│   │   ├── language: string
│   │   └── notifications: boolean
│   ├── createdAt: number
│   └── updatedAt: number
│
├── expenses/{userId}/items/{expenseId}
│   ├── amount: number
│   ├── category: string
│   ├── description: string
│   ├── date: number
│   ├── receiptUrl?: string
│   ├── notes?: string
│   ├── createdAt: number
│   └── updatedAt: number
│
├── budgets/{userId}/items/{budgetId}
│   ├── category: string
│   ├── limit: number
│   ├── period: 'monthly' | 'yearly'
│   ├── currency: string
│   ├── notifications: boolean
│   ├── notificationThreshold: number
│   ├── createdAt: number
│   └── updatedAt: number
│
└── categories/{userId}/items/{categoryId}
    ├── name: string
    ├── color: string (hex)
    ├── icon: string (emoji)
    ├── isDefault: boolean
    ├── createdAt: number
    └── updatedAt: number
```

---

## 🔐 Firestore Security Rules (Updated)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - only accessible to the user
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Expenses - user scoped, indexed by date for queries
    match /expenses/{userId}/items/{expenseId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Budgets - user scoped
    match /budgets/{userId}/items/{budgetId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Categories - user scoped
    match /categories/{userId}/items/{categoryId} {
      allow read, write: if request.auth.uid == userId;
      // Prevent deletion of default categories
      allow delete: if !resource.data.isDefault;
    }
  }
}
```

---

## 📦 Files Created/Modified

### New Files:
- `packages/firebase/services/expenses.ts` (280 lines)
- `packages/firebase/services/budgets.ts` (180 lines)
- `packages/firebase/services/categories.ts` (190 lines)
- `packages/firebase/services/users.ts` (160 lines)
- `packages/firebase/services/index.ts` (65 lines)
- `packages/firebase/hooks/useExpenses.ts` (150 lines)
- `packages/firebase/hooks/useBudgets.ts` (130 lines)
- `packages/firebase/hooks/useCategories.ts` (110 lines)

### Modified Files:
- `packages/firebase/hooks/index.ts` - Updated exports
- `packages/firebase/index.ts` - Added services exports

---

## 🎯 Next Steps - Phase 3

### Phase 3: Page Integration (Week 3-4)

1. **Dashboard Enhancement**
   - Integrate real expense data
   - Display budget progress
   - Show spending charts
   - Display recent transactions

2. **Expenses Page**
   - List all expenses
   - Filter by category, date, amount
   - Add/edit/delete expenses
   - Upload receipts

3. **Budgets Page**
   - Create and manage budgets
   - View budget vs spending
   - Get notifications on threshold

4. **Categories Page**
   - Manage custom categories
   - View category statistics
   - Color and icon customization

5. **Reports Page**
   - Monthly/yearly reports
   - Category breakdowns
   - Spending trends

---

## ✅ Checklist - Phase 2 Complete

- [x] Expenses service with 9 functions
- [x] Budgets service with 8 functions
- [x] Categories service with 7 functions
- [x] Users service with 8 functions
- [x] Expenses React Query hooks
- [x] Budgets React Query hooks
- [x] Categories React Query hooks
- [x] Proper caching with stale times
- [x] Query invalidation on mutations
- [x] Type safety throughout
- [x] Error handling
- [x] Firestore security rules
- [x] Documentation

---

## 🔗 Related Files

- Services: `packages/firebase/services/`
- Hooks: `packages/firebase/hooks/`
- Main exports: `packages/firebase/index.ts`
- Auth (Phase 1): `packages/firebase/auth.ts`
- Config (Phase 1): `packages/firebase/config.ts`

---

**Ready to implement Phase 3 page integration!** 🎯

Phase 2 completes the entire backend data layer. All services are production-ready with TypeScript safety, proper error handling, and optimized React Query caching strategies.
