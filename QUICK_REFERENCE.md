# FundTrack Phase 2 - Quick Reference Guide 🚀

**Version:** 1.0  
**Last Updated:** January 4, 2026  
**Status:** Production Ready

---

## 🎯 Quick Start

### Import Everything You Need
```typescript
import {
  // Services (direct Firestore operations)
  addExpense, updateExpense, deleteExpense,
  addBudget, updateBudget, deleteBudget,
  getCategories, initializeDefaultCategories,
  // Hooks (React Query integration)
  useExpenses, useBudgets, useCategories,
  useAddExpense, useUpdateExpense, useDeleteExpense,
  useAuth, // Get current user
} from '@fundtrack/firebase';
```

---

## 📝 Common Patterns

### 1️⃣ Display Expenses List
```typescript
export default function ExpensesPage() {
  const { user } = useAuth();
  const { data: expenses, isLoading } = useExpenses(user?.uid);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {expenses?.map(exp => (
        <li key={exp.id}>
          {exp.description}: ${exp.amount}
        </li>
      ))}
    </ul>
  );
}
```

### 2️⃣ Add New Expense
```typescript
export default function AddExpensePage() {
  const { user } = useAuth();
  const { mutate: addExpense, isPending } = useAddExpense(user?.uid);
  
  const handleAdd = () => {
    addExpense({
      amount: 50,
      category: 'Food & Dining',
      description: 'Lunch at restaurant',
      date: Date.now(),
    });
  };
  
  return <button onClick={handleAdd}>{isPending ? 'Adding...' : 'Add'}</button>;
}
```

### 3️⃣ Show Monthly Spending Breakdown
```typescript
export default function ReportPage() {
  const { user } = useAuth();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const endOfMonth = Date.now();
  
  const { data: spending } = useSpendingByCategory(
    user?.uid,
    startOfMonth,
    endOfMonth
  );
  
  return (
    <div>
      {Object.entries(spending || {}).map(([category, amount]) => (
        <div key={category}>
          <span>{category}</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
```

### 4️⃣ Manage Budgets
```typescript
export default function BudgetPage() {
  const { user } = useAuth();
  const { data: budgets } = useBudgets(user?.uid);
  const { mutate: addBudget } = useAddBudget(user?.uid);
  
  const createBudget = () => {
    addBudget({
      category: 'Food & Dining',
      limit: 500,
      period: 'monthly',
      currency: 'USD',
    });
  };
  
  return (
    <div>
      {budgets?.map(b => (
        <div key={b.id}>
          <h3>{b.category}</h3>
          <p>Monthly limit: ${b.limit}</p>
        </div>
      ))}
      <button onClick={createBudget}>Create Budget</button>
    </div>
  );
}
```

### 5️⃣ View Budget Progress
```typescript
export default function BudgetProgress() {
  const { user } = useAuth();
  const currentSpending = 250; // Calculate from expenses
  
  const { data: progress } = useBudgetProgress(
    user?.uid,
    'Food & Dining',
    currentSpending
  );
  
  return (
    <div>
      <h3>Food & Dining</h3>
      <p>Spent: ${progress?.spent} of ${progress?.limit}</p>
      <p>Progress: {progress?.percentage}%</p>
      <p>Remaining: ${progress?.remaining}</p>
    </div>
  );
}
```

### 6️⃣ Initialize Categories for New User
```typescript
export default function SignupPage() {
  const handleSignup = async () => {
    // Create account
    const user = await signUpWithEmail('user@example.com', 'password');
    
    // Initialize default categories
    await initializeDefaultCategories(user.uid);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };
  
  return <button onClick={handleSignup}>Sign Up</button>;
}
```

---

## 🔑 Available Services

### Expenses
| Function | Purpose | Returns |
|----------|---------|---------|
| `addExpense(userId, data)` | Create expense | expenseId |
| `updateExpense(userId, id, data)` | Edit expense | void |
| `deleteExpense(userId, id)` | Delete expense | void |
| `getExpenses(userId)` | Get all | Expense[] |
| `getExpensesByDateRange(uid, start, end)` | Query by date | Expense[] |
| `getExpensesByCategory(uid, cat)` | Query by cat | Expense[] |
| `getTotalSpending(uid, start, end)` | Total amount | number |
| `getSpendingByCategory(uid, start, end)` | Breakdown | Record<string, number> |

### Budgets
| Function | Purpose | Returns |
|----------|---------|---------|
| `addBudget(userId, data)` | Create budget | budgetId |
| `updateBudget(userId, id, data)` | Edit budget | void |
| `deleteBudget(userId, id)` | Delete budget | void |
| `getBudgets(userId)` | Get all | Budget[] |
| `getBudgetByCategory(uid, cat)` | Get one | Budget \| null |
| `isBudgetExceeded(uid, cat, spent)` | Check limit | boolean |
| `getBudgetProgress(uid, cat, spent)` | Get progress | ProgressInfo |

### Categories
| Function | Purpose | Returns |
|----------|---------|---------|
| `initializeDefaultCategories(uid)` | Setup defaults | void |
| `addCategory(uid, data)` | Create custom | categoryId |
| `updateCategory(uid, id, data)` | Edit category | void |
| `deleteCategory(uid, id)` | Delete (not default) | void |
| `getCategories(userId)` | Get all | Category[] |
| `getCategoryByName(uid, name)` | Lookup | Category \| null |

### Users
| Function | Purpose | Returns |
|----------|---------|---------|
| `createUserProfile(uid, data)` | Setup profile | void |
| `getUserProfile(uid)` | Get profile | UserProfile \| null |
| `updateUserProfile(uid, data)` | Edit profile | void |
| `updateUserPreferences(uid, prefs)` | Change settings | void |
| `getUserCurrency(uid)` | Get currency | string |
| `getUserTheme(uid)` | Get theme | 'light' \| 'dark' |
| `getUserTimezone(uid)` | Get timezone | string |

---

## 🎣 Available Hooks

### Query Hooks (Read Data)
```typescript
// Expenses
useExpenses(userId)                          // All expenses
useExpensesByDateRange(uid, start, end)      // Date range
useExpensesByCategory(uid, category)         // By category
useTotalSpending(uid, start, end)            // Calculate total
useSpendingByCategory(uid, start, end)       // Breakdown

// Budgets
useBudgets(userId)                           // All budgets
useBudgetByCategory(uid, category)           // Get one
useIsBudgetExceeded(uid, category, spent)    // Check status
useBudgetProgress(uid, category, spent)      // Get progress

// Categories
useCategories(userId)                        // All categories
useCategoryByName(uid, name)                 // Lookup
```

### Mutation Hooks (Write Data)
```typescript
// Expenses (returns { mutate, isPending, error, isError })
useAddExpense(userId)                        // Create
useUpdateExpense(userId)                     // Edit
useDeleteExpense(userId)                     // Delete

// Budgets
useAddBudget(userId)
useUpdateBudget(userId)
useDeleteBudget(userId)

// Categories
useAddCategory(userId)
useUpdateCategory(userId)
useDeleteCategory(userId)
useInitializeDefaultCategories(userId)       // Special: setup defaults
```

---

## 🔄 Hook Return Values

### Query Hooks Return:
```typescript
{
  data: T | undefined,           // The actual data
  isLoading: boolean,            // First load
  isFetching: boolean,           // Background refetch
  isError: boolean,              // Had an error
  error: Error | null,           // Error details
  refetch: () => Promise<T>,     // Manual refetch
}
```

### Mutation Hooks Return:
```typescript
{
  mutate: (data: Input) => void,       // Call to execute
  mutateAsync: (data: Input) => Promise, // Async version
  isPending: boolean,                  // Loading
  isError: boolean,                    // Had error
  error: Error | null,                 // Error details
  isSuccess: boolean,                  // Success flag
}
```

---

## 📊 Data Types

### Expense
```typescript
{
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: number;                    // Unix timestamp
  receiptUrl?: string;             // Optional receipt photo
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Budget
```typescript
{
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  currency: string;
  notifications: boolean;
  notificationThreshold: number;   // 0-100 percentage
  createdAt: number;
  updatedAt: number;
}
```

### Category
```typescript
{
  id: string;
  userId: string;
  name: string;
  color: string;                   // Hex like #FF5733
  icon: string;                    // Emoji like 🍽️
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## 🎯 Typical Component Flow

```typescript
'use client'; // Client component

import { useAuth, useExpenses, useAddExpense } from '@fundtrack/firebase';

export default function Component() {
  // 1. Get current user
  const { user } = useAuth();
  
  // 2. Query data
  const { data: expenses, isLoading } = useExpenses(user?.uid);
  
  // 3. Setup mutation
  const { mutate: addExpense } = useAddExpense(user?.uid);
  
  // 4. Handle action
  const handleAdd = () => {
    addExpense({
      amount: 50,
      category: 'Food & Dining',
      description: 'Lunch',
      date: Date.now(),
    });
    // useExpenses query auto-refetches!
  };
  
  // 5. Render
  if (isLoading) return <div>Loading...</div>;
  return <button onClick={handleAdd}>Add Expense</button>;
}
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Don't: Use without user
```typescript
// BAD - user might be undefined
useExpenses(user.uid) // 💥 Error if user is null
```

### ✅ Do: Check for user first
```typescript
// GOOD
useExpenses(user?.uid) // Safe with optional chaining
// Query will be disabled if user is null
```

### ❌ Don't: Call hooks conditionally
```typescript
// BAD - Rules of Hooks violated
if (user) {
  useExpenses(user.uid);
}
```

### ✅ Do: Always call, pass null if needed
```typescript
// GOOD
const { data } = useExpenses(user?.uid);
// Hook always called, query disabled if uid is null
```

---

## 🚀 Performance Tips

1. **Use date range queries** for large datasets
   ```typescript
   // Better than loading all expenses
   useExpensesByDateRange(uid, startDate, endDate)
   ```

2. **Filter on client** for small datasets
   ```typescript
   // Okay for <100 items
   expenses?.filter(e => e.category === 'Food')
   ```

3. **Don't refetch unnecessarily**
   ```typescript
   // Good - 5 min stale time by default
   useExpenses(uid)
   
   // Bad - refetches every render
   useExpenses(uid)
   // ... then manually calling refetch in useEffect
   ```

---

## 🐛 Debugging Tips

### Check React Query DevTools
```bash
# Add to package.json and open browser DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools initialIsOpen={false} />
```

### Log Query State
```typescript
const query = useExpenses(user?.uid);
console.log('State:', {
  status: query.status,
  data: query.data,
  error: query.error,
});
```

### Test Services Directly
```typescript
// In browser console or test file
import { getExpenses } from '@fundtrack/firebase';
const data = await getExpenses('userId123');
console.log(data);
```

---

## 📚 Learn More

- **Phase 1 (Auth):** See `MILESTONE_2_PHASE_1.md`
- **Phase 2 (Services & Hooks):** See `MILESTONE_2_PHASE_2.md`
- **Full Implementation:** Check source files in `packages/firebase/`

---

**Ready to build! 🎯**

All services and hooks are production-ready. Start integrating into pages!
