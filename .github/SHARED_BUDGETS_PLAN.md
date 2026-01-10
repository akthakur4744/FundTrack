# Shared Budgets Implementation Plan

**Date:** January 10, 2026  
**Phase:** 5 - User Profile & Advanced Features  
**Task:** #4 - Shared Budgets Foundation  
**Timeline:** 2-3 weeks  
**Status:** 🔄 IN-PROGRESS

---

## Overview

Shared Budgets enables FundTrack users to collaborate on expense tracking and splitting. Users can:
- Create shared budgets and invite collaborators
- Add shared expenses that split costs automatically
- Track who owes whom and settle balances
- View shared expense history and analytics
- Manage group finances transparently

**Use Cases:**
- Roommates splitting rent, groceries, utilities
- Group trips with shared expenses
- Team projects with shared costs
- Family budget management

---

## Feature Requirements

### Core Features

1. **Create Shared Budget**
   - Invite members via email (with pending accept)
   - Set budget category and amount
   - Define splitting method (equal, custom, itemized)
   - Set shared budget period (monthly, custom date range)

2. **Add Shared Expenses**
   - Designate who paid (not necessarily contributor)
   - Add expense details (description, amount, date, category)
   - Assign participants and split amounts
   - Support itemized splitting (each person pays different items)
   - Optional: Link to recurring expenses

3. **Member Management**
   - View all members in a shared budget
   - Send/revoke invitations
   - Remove members
   - Track member contribution history
   - View member balance details

4. **Balance Tracking**
   - Calculate who owes whom
   - Show settlement suggestions (optimal payment paths)
   - Track payment history
   - Display running balance per member

5. **Settlements**
   - Record payments between members
   - Auto-suggest settlement amounts
   - Payment history with timestamps
   - Mark balances as settled

---

## Data Model

### Firestore Collections

#### **sharedBudgets/{budgetId}**
```typescript
interface SharedBudget {
  id: string;
  createdBy: string;                    // User ID of creator
  name: string;                         // "Apartment Rent"
  description?: string;
  category: string;                     // "Housing", "Groceries", etc.
  
  // Budget Details
  totalBudget: number;                  // Total amount for period
  currency: string;
  period: 'monthly' | 'custom';
  startDate: Timestamp;
  endDate?: Timestamp;
  
  // Members
  members: {
    [userId: string]: {
      status: 'active' | 'invited' | 'left';
      joinedAt: Timestamp;
      role: 'admin' | 'member';       // Only creator is admin initially
      splitPercentage?: number;        // For equal split: 100/memberCount
    };
  };
  
  // Metadata
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### **sharedBudgets/{budgetId}/expenses/{expenseId}**
```typescript
interface SharedExpense {
  id: string;
  budgetId: string;
  
  // Expense Details
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Timestamp;
  
  // Payment Info
  paidBy: string;                       // User who paid
  paidByAmount: number;                 // What they paid (full amount)
  
  // Splits
  splits: {
    [userId: string]: {
      amount: number;                   // How much this person owes
      itemized?: {                      // Optional itemized details
        items: Array<{
          description: string;
          amount: number;
          quantity?: number;
        }>;
      };
    };
  };
  
  // Receipt
  receiptUrl?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### **sharedBudgets/{budgetId}/settlements/{settlementId}**
```typescript
interface Settlement {
  id: string;
  budgetId: string;
  
  // Payment Details
  from: string;                         // Payer user ID
  to: string;                           // Payee user ID
  amount: number;
  currency: string;
  
  // Payment Status
  status: 'pending' | 'completed';
  relatedExpenseId?: string;            // Links to shared expense
  
  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp;
  note?: string;
}
```

#### **sharedBudgetInvites/{inviteId}** (or emails in members array)
```typescript
interface SharedBudgetInvite {
  id: string;
  budgetId: string;
  invitedBy: string;                    // User ID who sent invite
  invitedEmail: string;                 // Email address
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  expiresAt: Timestamp;                 // 30 days from creation
}
```

---

## Architecture

### Three-Layer Pattern (like Recurring Expenses)

#### Layer 1: Firebase Services (`packages/firebase/services/sharedBudgets.ts`)

**Budget Management:**
```typescript
createSharedBudget(userId, data): Promise<string>
  // Validates data, creates budget, adds creator as admin

getSharedBudgets(userId): Promise<SharedBudget[]>
  // Returns all budgets user is member of (active + invited)

getSharedBudgetById(userId, budgetId): Promise<SharedBudget | null>
  // Single budget with auth check

updateSharedBudget(userId, budgetId, updates): Promise<void>
  // Update budget details (admin only)

deleteSharedBudget(userId, budgetId): Promise<void>
  // Soft delete (set isActive = false)
```

**Member Management:**
```typescript
inviteMember(userId, budgetId, email): Promise<void>
  // Send invite, store in invites collection or members.status='invited'

acceptInvite(userId, budgetId): Promise<void>
  // Change member status to 'active'

removeMember(userId, budgetId, memberId): Promise<void>
  // Remove member from budget

getMembers(budgetId): Promise<{userId: string, status, role}[]>
  // List all members with their status
```

**Expense Management:**
```typescript
addSharedExpense(userId, budgetId, data): Promise<string>
  // Validates splits sum to total amount, creates expense

updateSharedExpense(userId, budgetId, expenseId, updates): Promise<void>
  // Update expense and recalculate balances

deleteSharedExpense(userId, budgetId, expenseId): Promise<void>
  // Remove expense and update member balances

getSharedExpenses(budgetId): Promise<SharedExpense[]>
  // All expenses in budget

getSharedExpensesByMember(budgetId, userId): Promise<SharedExpense[]>
  // Expenses involving specific member
```

**Balance & Settlement:**
```typescript
calculateBalances(budgetId): Promise<BalanceSummary>
  // Returns { [userId]: { owes, owed, balance } }

calculateSettlements(budgetId): Promise<Settlement[]>
  // Suggests optimal payment routes (algorithm)

recordSettlement(userId, budgetId, fromId, toId, amount): Promise<void>
  // Record a payment between members

getSettlementHistory(budgetId): Promise<Settlement[]>
  // All settlements in budget
```

#### Layer 2: React Query Hooks (`packages/firebase/hooks/useSharedBudgets.ts`)

Similar pattern to recurring expenses:
```typescript
useCreateSharedBudget(userId)
useSharedBudgets(userId)
useSharedBudgetById(userId, budgetId)
useSharedBudgetMembers(budgetId)
useSharedExpenses(budgetId)
useAddSharedExpense(userId, budgetId)
useDeleteSharedExpense(userId, budgetId)
useBalances(budgetId)
useSettlements(budgetId)
useRecordSettlement(userId, budgetId)
```

#### Layer 3: UI Components

**Pages:**
1. `/app/shared/page.tsx` - List of shared budgets
2. `/app/shared/[id]/page.tsx` - Budget detail with tabs:
   - Overview (members, total, period)
   - Expenses (list with filtering)
   - Balances (who owes whom)
   - Settlements (payment history)
3. `/app/shared/[id]/expenses/new` - Add shared expense form
4. `/app/shared/[id]/settings` - Budget settings (admin only)

**Components:**
1. `CreateSharedBudgetModal.tsx` - Create budget + invite members
2. `AddSharedExpenseModal.tsx` - Add expense with splitting
3. `MemberManagement.tsx` - Invite/remove members
4. `BalanceCard.tsx` - Show individual balance
5. `SettlementSuggestion.tsx` - Suggest payments
6. `PaymentHistory.tsx` - Settlement list

---

## Implementation Phases

### Phase 4.1: Data Model & Types (2 days)

**Files:**
- `packages/shared/types/sharedBudgets.ts`
- `packages/shared/schemas/sharedBudgetSchema.ts`

**Tasks:**
- Define all TypeScript interfaces
- Create Zod validation schemas
- Add utility types for balance calculations

---

### Phase 4.2: Firebase Services (4 days)

**File:** `packages/firebase/services/sharedBudgets.ts` (600+ lines)

**Tasks:**
- Budget CRUD operations
- Member management (invite, accept, remove)
- Expense CRUD with split validation
- Balance calculation algorithm
- Settlement suggestion algorithm
- Firestore batch operations for consistency

**Key Challenges:**
- Validate splits sum to total amount
- Ensure only authorized users can modify
- Handle member role/permission checks
- Calculate optimal settlement paths (complex algorithm)

---

### Phase 4.3: React Query Hooks (3 days)

**File:** `packages/firebase/hooks/useSharedBudgets.ts` (250+ lines)

**Tasks:**
- Implement 10+ custom hooks
- Proper cache invalidation on mutations
- Real-time balance updates
- Error handling and user feedback

---

### Phase 4.4: UI Components & Pages (5 days)

**Files:**
- 4 new pages (list, detail, new expense, settings)
- 6 reusable components
- Navigation integration

**Tasks:**
- Create modals for invite flow
- Build expense splitting UI
- Display balances with visual indicators
- Settlement payment recording

---

### Phase 4.5: Testing & Polish (3 days)

**Tasks:**
- End-to-end testing of complete flow
- Balance calculation verification
- Permission/authorization checks
- Mobile responsiveness
- Error message clarity

---

## Algorithm Highlights

### Balance Calculation
```
For each shared expense:
  - Person who paid gets credited
  - Everyone else in split owes their amount
  
Summary per user:
  - "Owed to you" = total they paid - total they owe
  - "You owe" = total they owe - total they paid
  - Negative = they owe, Positive = owed to them
```

### Settlement Suggestion (Greedy Algorithm)
```
While there are debts:
  1. Find person with highest balance (owed most)
  2. Find person with lowest balance (owes most)
  3. Settle as much as possible between them
  4. Record settlement, remove from list
  5. Repeat until all settled
  
This minimizes number of transactions needed
```

---

## Integration Points

### With Existing Features

**Expenses:**
- Shared expenses linked to budget
- Filter option to show/hide shared
- Receipt upload for shared expenses
- Category system extended to shared

**Budgets:**
- Shared budgets separate from personal
- Own budget section for individual tracking
- Can move expenses between personal/shared

**Reports:**
- Shared expense analytics
- Balance trends over time
- Member contribution reports
- Settlement statistics

---

## Security & Permissions

**Firestore Rules:**
```
- Only members can read shared budget
- Only admin can update budget settings
- Only members can add/read expenses
- Only budget member or admin can delete
- Only involved parties can record settlement
```

**Authorization Checks:**
- Verify user is member before any operation
- Check admin role for setting changes
- Validate user email for invites

---

## File Structure

### Before
```
apps/webview/src/app/
├── expenses/
├── budgets/
├── recurring/
└── reports/
```

### After
```
apps/webview/src/app/
├── expenses/
├── budgets/
├── recurring/
├── shared/              (NEW)
│   ├── page.tsx
│   ├── [id]/
│   │   ├── page.tsx
│   │   ├── expenses/
│   │   │   └── new.tsx
│   │   └── settings/
│   │       └── page.tsx
├── reports/
```

---

## Estimated Effort

| Phase | Task | Days | Status |
|-------|------|------|--------|
| 4.1 | Data Model & Types | 2 | 🔄 Next |
| 4.2 | Firebase Services | 4 | Pending |
| 4.3 | React Query Hooks | 3 | Pending |
| 4.4 | UI Components | 5 | Pending |
| 4.5 | Testing & Polish | 3 | Pending |
| | **TOTAL** | **17 days** | |

**Expected Completion:** January 27-28, 2026

---

## Dependencies

- ✅ Firebase Firestore (auth, rules)
- ✅ React Query (hooks)
- ✅ TypeScript + Zod
- ⚠️ Settlement algorithm library (optional - can implement custom)
- ⚠️ Email invitation system (can use simple email in invite doc)

---

## Known Complexity Areas

1. **Split Calculation** - Ensure all splits sum exactly to expense amount
2. **Settlement Algorithm** - Find optimal payment routes
3. **Authorization** - Verify user permissions at every step
4. **Batch Operations** - Maintain consistency when adding shared expenses
5. **Real-time Updates** - Keep balances synced across devices
6. **Email Invitations** - Implement invite/accept flow with emails

---

## Success Criteria

✅ Users can create shared budgets with multiple members  
✅ Members can add shared expenses with flexible splitting  
✅ Balances calculated correctly for all users  
✅ Settlements suggested and recorded  
✅ UI is intuitive and mobile-responsive  
✅ All operations have proper error handling  
✅ No data inconsistencies across devices  
✅ Performance optimized for 100+ expenses  

---

**Next Action:** Start Phase 4.1 with type definitions and schemas

---

**Document Version:** 1.0  
**Last Updated:** January 10, 2026  
**Owner:** GitHub Copilot
