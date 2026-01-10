# Recurring Expenses Implementation Plan

**Date:** January 6, 2026  
**Phase:** 5 - User Profile & Advanced Features  
**Task:** #3 - Recurring Expenses  
**Timeline:** 1-2 weeks  
**Status:** 🔄 IN-PROGRESS

---

## Overview

Recurring Expenses allows users to create expenses that automatically repeat at specified intervals (daily, weekly, monthly, yearly). This reduces manual data entry for predictable expenses and improves the overall user experience.

---

## Feature Requirements

### User Stories

1. **Create Recurring Expense**
   - User can select frequency (daily, weekly, monthly, yearly)
   - User can set an end date (optional - defaults to 1 year from creation)
   - System auto-generates future expenses up to end date
   - Recurring expenses show a "badge" on the expense list

2. **View Recurring Series**
   - User can click a recurring badge to see all instances
   - User can see which are past/future/generated/manual

3. **Edit Recurring Expense**
   - User can change frequency, amount, category
   - Changes apply to future occurrences only (not past)

4. **Cancel Recurring Series**
   - User can stop a recurring series
   - Past expenses remain unchanged
   - Future occurrences deleted

5. **Analytics & Reports**
   - Show recurring expense totals
   - Forecast monthly/yearly spending with recurrence

---

## Architecture

### Data Model

#### Firestore Collection: `recurringExpenses/{userId}/{recurringId}`

```typescript
interface RecurringExpense {
  // Identifiers
  id: string;                          // UUID
  userId: string;                      // Owner
  
  // Base Information
  description: string;                 // "Netflix Subscription"
  amount: number;                      // 15.99
  category: string;                    // "Entertainment"
  
  // Recurrence Details
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Timestamp;                // When first instance was/will be
  endDate?: Timestamp;                 // Optional - null = recurring indefinitely
  
  // Weekly Specific
  daysOfWeek?: number[];              // [0, 3, 5] = Mon, Wed, Fri (if frequency='weekly')
  
  // Monthly Specific
  dayOfMonth?: number;                // 15 = 15th of each month (if frequency='monthly')
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  nextInstanceDue: Timestamp;         // For sorting/filtering
  isActive: boolean;                  // Soft delete / pause
}
```

#### Firestore Collection: `expenses/{userId}/{expenseId}`

Add optional field to link expenses to recurring series:

```typescript
interface Expense {
  // ... existing fields ...
  
  // New optional field
  recurringExpenseId?: string;        // Reference to parent recurring expense
  isRecurringInstance: boolean;        // Mark auto-generated expenses
}
```

### Three-Layer Architecture

#### Layer 1: Firestore Services (`packages/firebase/services/recurring.ts`)

```typescript
// Create
createRecurringExpense(userId, data): Promise<string>
  // Validates frequency, dates
  // Generates initial set of expenses (first 12 months)
  // Returns recurringExpenseId

// Read
getRecurringExpenses(userId): Promise<RecurringExpense[]>
  // Fetch all recurring expenses for user
  
getRecurringExpenseById(userId, id): Promise<RecurringExpense>
  // Single recurring expense

getRecurringInstances(userId, recurringId): Promise<Expense[]>
  // All generated expenses from this recurring series

// Update
updateRecurringExpense(userId, id, updates): Promise<void>
  // Update recurring series (applies to future expenses)
  // Deletes future auto-generated instances, regenerates

// Delete
deleteRecurringExpense(userId, id): Promise<void>
  // Soft delete (set isActive = false)

deleteRecurringExpenseHard(userId, id): Promise<void>
  // Hard delete + cleanup all instances (DANGEROUS - requires confirmation)
```

#### Layer 2: React Query Hooks (`packages/firebase/hooks/useRecurring.ts`)

```typescript
// Create
useCreateRecurringExpense()
  // mutation with validation
  // invalidates all relevant queries on success

// Read
useRecurringExpenses(userId)
  // query for all recurring expenses
  // staleTime: 10 minutes

useRecurringExpenseById(userId, id)
  // query for single recurring expense
  
useRecurringInstances(userId, recurringId)
  // query for all instances of a recurring series

// Update
useUpdateRecurringExpense(userId)
  // mutation for updating recurring expense
  
// Delete
useDeleteRecurringExpense(userId)
  // mutation for soft delete
  
useDeleteRecurringExpenseHard(userId)
  // mutation for hard delete
```

#### Layer 3: UI Components

**New Pages/Components:**

1. **Create Recurring Expense Modal**
   - Description input
   - Amount input
   - Category dropdown (from useCategories)
   - Frequency selector (radio buttons: daily/weekly/monthly/yearly)
   - Week day picker (shows if frequency='weekly')
   - Day of month picker (shows if frequency='monthly')
   - Start date picker
   - End date picker (optional)
   - Preview: "This will create X expenses between [start] and [end]"
   - Create button

2. **Recurring Expense List Page** (`/app/recurring/page.tsx`)
   - Table/cards of all recurring expenses
   - Status badge (active/inactive)
   - Frequency badge (daily/weekly/monthly/yearly)
   - Next due date
   - Actions: View Details / Edit / Delete
   - Total monthly/yearly estimate

3. **Recurring Expense Detail Page** (`/app/recurring/[id]/page.tsx`)
   - Show recurring expense details
   - Show all generated instances (paginated)
   - Edit button (opens modal)
   - Delete button with confirmation
   - View analytics for this recurring series

4. **Enhanced Expense List** (modify existing `/app/expenses/page.tsx`)
   - Add "recurring" badge to expenses created from recurring series
   - Click badge to jump to recurring expense detail
   - Filter by: "Recurring" or "One-time"
   - Show upcoming recurring expenses in summary

---

## Implementation Steps

### Phase 3.1: Data Model & Types (2 days)

**Files to Create:**
1. `packages/shared/types/recurring.ts`
   - Type definitions for RecurringExpense
   - Frequency enum
   - Validation constants

2. `packages/shared/schemas/recurringSchema.ts`
   - Zod validation for recurring expense creation
   - Validates frequency, dates, amounts

**What to Do:**
- Define RecurringExpense interface
- Create frequency constants: FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly']
- Export types for use in hooks and components

---

### Phase 3.2: Firebase Services (3 days)

**Files to Create:**
1. `packages/firebase/services/recurring.ts` (300+ lines)
   - `createRecurringExpense()` - Core function to:
     - Validate input with Zod
     - Create recurring document in Firestore
     - Generate expense instances for next 12 months
     - Handle timezone for date calculations
   
   - `getRecurringExpenses()` - List all active recurring expenses
   
   - `updateRecurringExpense()` - Update and regenerate future instances
   
   - `deleteRecurringExpense()` - Soft delete (pause)
   
   - Helper functions:
     - `generateNextOccurrence(frequency, startDate)` → Date
     - `generateExpenseInstances(recurring, startDate, endDate)` → Expense[]
     - `calculateNextInstanceDue(frequency, currentDate)` → Date

**Dependencies:**
- `packages/firebase/services/index.ts` - Export new functions
- Firebase Firestore (batch writes for generating expenses)
- date-fns library (for date math)

---

### Phase 3.3: React Query Hooks (2 days)

**Files to Create:**
1. `packages/firebase/hooks/useRecurring.ts` (150+ lines)
   - All hook implementations with proper:
     - Error handling
     - Loading states
     - Query invalidation
     - Optimistic updates (optional)

**What to Do:**
- Implement each hook with proper React Query patterns
- Add error messages for user feedback
- Invalidate expense queries when recurring changes

---

### Phase 3.4: UI Components (4 days)

**Files to Create:**

1. `apps/webview/src/app/recurring/page.tsx` (300+ lines)
   - List of all recurring expenses
   - Cards/table with: description, amount, frequency, next due, status
   - Create button opens modal
   - Edit/Delete/View actions

2. `apps/webview/src/app/recurring/[id]/page.tsx` (350+ lines)
   - Detail page for single recurring expense
   - Show all generated instances with pagination
   - View/edit toggle (like expense detail)
   - Delete with confirmation modal
   - Links to related expenses

3. `apps/webview/src/components/CreateRecurringModal.tsx` (300+ lines)
   - Reusable modal for creating/editing recurring expenses
   - Dynamic UI based on frequency selection
   - Live preview of expense count and dates
   - Form validation and error messages

4. Modify `apps/webview/src/app/expenses/page.tsx`
   - Add "recurring" badge to expenses with recurringExpenseId
   - Filter controls: "All / Recurring / One-time"
   - Summary showing next recurring expenses

5. Update Navigation
   - Add "Recurring" to main navigation
   - Link: `/recurring`

---

### Phase 3.5: Testing & Polish (2 days)

- Manual testing all CRUD operations
- Test date generation for all frequencies
- Test timezone handling
- Mobile responsive testing
- Edge cases:
  - Leap years (Feb 29)
  - Month boundaries (Jan 31 → Feb 28/29)
  - Daylight saving time transitions
  - Very long recurring series (10+ years)

---

## Key Implementation Details

### Date Generation Algorithm

**For Daily:**
```
nextDate = currentDate + 1 day
```

**For Weekly:**
```
// If multiple days selected: [0, 3, 5] = Mon, Wed, Fri
nextDate = currentDate
while nextDate.dayOfWeek not in daysOfWeek:
  nextDate += 1 day
```

**For Monthly:**
```
// Handle month boundaries: if dayOfMonth=31 and month has 30 days, use day 30
nextDate = Date(currentDate.year, currentDate.month + 1, dayOfMonth)
if nextDate.day != dayOfMonth:
  nextDate = last day of that month
```

**For Yearly:**
```
// Handle leap year: Feb 29 → Feb 28 on non-leap years
nextDate = Date(currentDate.year + 1, currentDate.month, currentDate.day)
if currentDate is Feb 29 and nextDate year not leap:
  nextDate = Feb 28
```

### Batch Operations

When creating recurring expenses, generate 12 months of instances in a **batched Firestore write**:

```typescript
const batch = writeBatch(db);
const recurringRef = doc(collection(db, 'recurringExpenses', userId), recurringId);

// Write recurring expense doc
batch.set(recurringRef, { ... });

// Write up to 12 expense docs
for (const expense of generatedExpenses.slice(0, 12)) {
  const expenseRef = doc(collection(db, 'expenses', userId));
  batch.set(expenseRef, { ...expense, recurringExpenseId });
}

await batch.commit();
```

This ensures all-or-nothing atomicity.

### Frontend Considerations

1. **Progressive Enhancement**
   - Show "next 3 instances" preview while creating
   - Update preview as user changes frequency/dates

2. **Timezone Awareness**
   - Store dates in UTC in Firestore
   - Display in user's local timezone
   - Use date-fns with timezone utilities

3. **Performance**
   - Pagination for instance lists (show 10 at a time)
   - Infinite scroll or "Load More" button
   - Cache recurring expenses list (staleTime: 10 min)

---

## File Structure (Before & After)

### Before
```
packages/shared/types/index.ts
packages/shared/schemas/
  ├── expenseSchema.ts
  └── budgetSchema.ts

apps/webview/src/app/
  ├── expenses/
  └── budgets/
```

### After
```
packages/shared/types/
  ├── index.ts (unchanged)
  ├── expense.ts (unchanged)
  └── recurring.ts (NEW)

packages/shared/schemas/
  ├── expenseSchema.ts (unchanged)
  ├── budgetSchema.ts (unchanged)
  └── recurringSchema.ts (NEW)

packages/firebase/services/
  ├── index.ts (add exports)
  └── recurring.ts (NEW - 300+ lines)

packages/firebase/hooks/
  ├── index.ts (add exports)
  └── useRecurring.ts (NEW - 150+ lines)

apps/webview/src/app/
  ├── expenses/
  │   └── page.tsx (modify - add recurring badge)
  ├── budgets/
  └── recurring/ (NEW)
      ├── page.tsx (list - 300+ lines)
      └── [id]/
          └── page.tsx (detail - 350+ lines)

apps/webview/src/components/
  └── CreateRecurringModal.tsx (NEW - 300+ lines)

apps/webview/src/navigation/ (modify)
  └── RootNavigator.tsx (add recurring link)
```

---

## Testing Checklist

- [ ] Create daily recurring expense
- [ ] Create weekly recurring expense (multiple days)
- [ ] Create monthly recurring expense
- [ ] Create yearly recurring expense
- [ ] Verify 12 months of instances generated
- [ ] Edit recurring expense (verify future instances update)
- [ ] Delete recurring expense (soft delete)
- [ ] Hard delete recurring expense + confirm cleanup
- [ ] View all instances of a series
- [ ] Filter expenses by recurring/one-time
- [ ] Recurring badge shows on expense list
- [ ] Timezone handling correct
- [ ] Leap year handling (Feb 29)
- [ ] Month boundary handling (Jan 31)
- [ ] Mobile responsive UI
- [ ] Error handling for invalid inputs

---

## Estimated Effort

| Phase | Task | Days | Status |
|-------|------|------|--------|
| 3.1 | Data Model & Types | 2 | 🔄 Next |
| 3.2 | Firebase Services | 3 | Pending |
| 3.3 | React Query Hooks | 2 | Pending |
| 3.4 | UI Components | 4 | Pending |
| 3.5 | Testing & Polish | 2 | Pending |
| | **TOTAL** | **13 days** | |

**Expected Completion:** January 19-20, 2026

---

## Dependencies

- ✅ date-fns (for date math) - may need to install
- ✅ React Query (already in project)
- ✅ Firebase Firestore (already in project)
- ✅ TypeScript + Zod (already in project)

---

## Next Immediate Action

Start with **Phase 3.1**: Create `packages/shared/types/recurring.ts` with full RecurringExpense type definition and frequency constants.

---

**Document Version:** 1.0  
**Last Updated:** January 6, 2026  
**Owner:** GitHub Copilot
