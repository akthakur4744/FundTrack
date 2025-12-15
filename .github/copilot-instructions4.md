# FundTrack Development - Milestone 4: Premium & Collaborative Features 👥 PLANNED

**Status:** Not Started  
**Target Duration:** 3-4 weeks  
**Dependency:** Completion of Milestone 3 (Advanced Features & Optimization)  
**Repository:** https://github.com/akthakur4744/FundTrack

---

## 🎯 Milestone 4 Objectives

Implement shared budget features, advanced AI-powered analytics, bank integration (optional), and premium features to enable collaborative expense tracking and intelligent financial insights.

---

## 📋 Detailed Task Breakdown

### Phase 1: Shared Budgets & Collaboration (Week 1)

#### 1.1 Firestore Schema Updates
- [ ] Update database structure:
  ```typescript
  interface SharedBudget {
    id: string;
    ownerUserId: string;
    name: string;
    description: string;
    totalBudget: number;
    currency: string;
    members: {
      userId: string;
      email: string;
      role: 'owner' | 'editor' | 'viewer';
      joinedAt: Date;
      status: 'active' | 'pending' | 'removed';
    }[];
    categories: string[]; // Categories included in shared budget
    createdAt: Date;
    updatedAt: Date;
  }

  interface SharedExpense {
    id: string;
    sharedBudgetId: string;
    expenseData: Expense;
    paidByUserId: string; // Who paid
    participants: {
      userId: string;
      share: number; // Amount this person owes
    }[];
    splitType: 'equal' | 'exact' | 'percentage' | 'itemized';
    createdAt: Date;
    updatedAt: Date;
  }

  interface ActivityLog {
    id: string;
    sharedBudgetId: string;
    userId: string;
    action: 'created' | 'added_member' | 'removed_member' | 'updated_expense' | 'changed_role';
    details: any;
    timestamp: Date;
  }
  ```

#### 1.2 Firebase Services for Shared Budgets
- [ ] Create `packages/firebase/services/sharedBudgets.ts`:
  - [ ] `createSharedBudget(userId, budgetData): Promise<id>`
  - [ ] `updateSharedBudget(budgetId, data): Promise<void>`
  - [ ] `deleteSharedBudget(budgetId): Promise<void>`
  - [ ] `getSharedBudget(budgetId): Promise<SharedBudget>`
  - [ ] `getSharedBudgetsForUser(userId): Promise<SharedBudget[]>`

- [ ] Create `packages/firebase/services/members.ts`:
  - [ ] `inviteMember(budgetId, email, role): Promise<void>`
    - [ ] Send invitation email (Firebase Function)
    - [ ] Create pending member record
  - [ ] `acceptInvitation(invitationId): Promise<void>`
  - [ ] `removeMember(budgetId, userId): Promise<void>`
  - [ ] `changeRole(budgetId, userId, newRole): Promise<void>`
  - [ ] `getMembers(budgetId): Promise<Member[]>`

- [ ] Create `packages/firebase/services/activityLog.ts`:
  - [ ] `logActivity(budgetId, userId, action, details): Promise<void>`
  - [ ] `getActivityLog(budgetId, limit: number): Promise<ActivityLog[]>`

#### 1.3 Shared Budget Pages
- [ ] Create `apps/webview/src/app/shared-budgets/page.tsx`:
  - [ ] List all shared budgets (owned + participating)
  - [ ] Show budget status and members
  - [ ] "Create New Shared Budget" button
  - [ ] "Join Shared Budget" option (via invitation link)

- [ ] Create `apps/webview/src/app/shared-budgets/[id]/page.tsx`:
  - [ ] Display shared budget details
  - [ ] Show all members with roles
  - [ ] Show shared expenses breakdown
  - [ ] Show settlement calculations (who owes whom)
  - [ ] Expense split visualization

#### 1.4 Invite & Management UI
- [ ] Create `apps/webview/src/components/InviteMembersModal.tsx`:
  - [ ] Email input field
  - [ ] Role selector (editor, viewer)
  - [ ] Send invitation button
  - [ ] Show pending invitations

- [ ] Create `apps/webview/src/components/MembersPanel.tsx`:
  - [ ] List all members with roles
  - [ ] Change role dropdown (if owner)
  - [ ] Remove member button (if owner)
  - [ ] Activity timeline

#### 1.5 Expense Splitting
- [ ] Create `apps/webview/src/components/ExpenseSplitter.tsx`:
  - [ ] Split type selector (Equal, Exact, Percentage, Itemized)
  - [ ] UI for each split type:
    - [ ] **Equal:** Auto-calculate equal split
    - [ ] **Exact:** Input exact amounts for each person
    - [ ] **Percentage:** Input percentage for each person
    - [ ] **Itemized:** Assign items to people
  - [ ] Display calculated amounts for each participant
  - [ ] Validation (total must equal expense amount)

- [ ] Update `apps/webview/src/app/expenses/new/page.tsx`:
  - [ ] Add option to create shared expense
  - [ ] Show shared budget selector
  - [ ] Show participant selector
  - [ ] Integrate `<ExpenseSplitter />`
  - [ ] Calculate and save split data

#### 1.6 Settlement Calculations
- [ ] Create `packages/shared/utils/settlement.ts`:
  ```typescript
  interface Settlement {
    from: string; // userId
    to: string; // userId
    amount: number;
  }

  export const calculateSettlement = (sharedExpenses: SharedExpense[]): Settlement[] => {
    // Algorithm: Calculate who owes whom and minimize transactions
    // Use graph algorithm to optimize settlement payments
  };

  export const getBalances = (sharedExpenses: SharedExpense[], userId: string) => {
    // Get balance for specific user (positive = owed to them, negative = they owe)
  };
  ```

#### 1.7 Firebase Cloud Function for Invitations
- [ ] Create Cloud Function to send invitation emails:
  ```typescript
  export const sendBudgetInvitation = functions
    .firestore
    .document('sharedBudgets/{budgetId}/invitations/{invitationId}')
    .onCreate(async (snap, context) => {
      const invitation = snap.data();
      
      // Send email with invitation link and acceptance token
      await sendEmail({
        to: invitation.email,
        subject: `You're invited to a shared budget!`,
        template: 'budgetInvitation',
        data: {
          inviterName: invitation.inviterName,
          budgetName: invitation.budgetName,
          acceptLink: `https://fundtrack.app/join/${invitation.token}`,
        },
      });
    });
  ```

---

### Phase 2: Advanced Analytics & Insights (Week 2)

#### 2.1 Spending Pattern Analysis
- [ ] Create `packages/shared/utils/patterns.ts`:
  ```typescript
  export const analyzeSpendingPatterns = (expenses: Expense[]) => {
    return {
      mostExpensiveDay: getDayWithHighestSpending(expenses),
      averageCategoryBudget: calculateAverageByCategoryIfUsedAsBudget(expenses),
      weekdayVsWeekendRatio: compareWeekdayVsWeekend(expenses),
      consistencyScore: calculateConsistency(expenses), // 0-100
      volatility: calculateVariance(expenses),
      seasonalTrends: detectSeasonalPatterns(expenses),
    };
  };

  export const detectAnomalies = (expenses: Expense[]) => {
    // Find unusual spending in categories
    // Use statistical analysis (std dev)
  };

  export const getSpendingHabits = (expenses: Expense[]) => {
    return {
      frequentCategories: getTopCategories(expenses, 5),
      timeOfDay: analyzeExpenseTimePatterns(expenses),
      dayOfWeek: analyzeExpenseDayPatterns(expenses),
      budgetCompliance: calculateBudgetAdherence(expenses),
    };
  };
  ```

- [ ] Update `apps/webview/src/app/reports/page.tsx`:
  - [ ] Add "Insights" tab to reports
  - [ ] Display spending patterns with explanations
  - [ ] Show spending habits
  - [ ] Highlight anomalies/unusual spending

#### 2.2 Budget Optimization Suggestions
- [ ] Create `packages/shared/utils/optimization.ts`:
  ```typescript
  interface Recommendation {
    type: 'increase_budget' | 'reduce_spending' | 'set_goal' | 'adjust_allocation';
    category: string;
    reason: string;
    suggestion: string;
    impact: string; // Estimated impact
    priority: 'high' | 'medium' | 'low';
  }

  export const generateRecommendations = (
    expenses: Expense[],
    budgets: Budget[]
  ): Recommendation[] => {
    // Analyze spending vs budgets
    // Generate actionable recommendations
  };

  export const optimizeBudget = (
    expenses: Expense[],
    budgets: Budget[],
    targetSavings: number
  ) => {
    // Suggest how to allocate budget to meet savings goal
  };
  ```

- [ ] Create `apps/webview/src/components/RecommendationsCard.tsx`:
  - [ ] Display recommendations with icons
  - [ ] Show priority level (high/medium/low)
  - [ ] Action buttons (implement, dismiss, learn more)
  - [ ] Track dismissed recommendations

#### 2.3 Predictive Spending Forecast
- [ ] Create `packages/shared/utils/forecast.ts`:
  ```typescript
  export const forecastSpending = (
    expenses: Expense[],
    days: number = 30
  ): DailyForecast[] => {
    // Use historical data to predict future spending
    // Consider seasonality, patterns, trends
  };

  export const predictMonthlyTotal = (expenses: Expense[]): number => {
    // Predict month-end spending based on current trend
  };

  export const estimateGoalAchievement = (
    expenses: Expense[],
    goal: SavingGoal
  ): number => {
    // Percentage chance of achieving goal
  };
  ```

- [ ] Update Budget page:
  - [ ] Show predicted spending vs budget
  - [ ] Show confidence interval
  - [ ] Warn if on track to exceed budget

#### 2.4 Spending Benchmarking
- [ ] Create `packages/shared/utils/benchmarking.ts`:
  ```typescript
  export const compareToPreviousPeriods = (
    expenses: Expense[],
    category?: string
  ) => {
    return {
      thisMonth: getMonthTotal(expenses),
      lastMonth: getLastMonthTotal(expenses),
      avgLast3Months: getAvg3Months(expenses),
      trendIndicator: calculateTrend(expenses),
    };
  };

  export const getUnusualSpending = (
    expenses: Expense[],
    category: string
  ) => {
    // Identify spending significantly different from normal
  };
  ```

- [ ] Update Reports page:
  - [ ] Add comparison charts (this month vs last 3 months)
  - [ ] Show unusual spending highlights
  - [ ] Category performance vs average

---

### Phase 3: Bank Integration (Optional - Week 2-3)

#### 3.1 Plaid Setup
- [ ] Install Plaid SDK: `npm install --workspace=apps/webview plaid-link-web`

- [ ] Create `packages/firebase/services/plaid.ts`:
  - [ ] Initialize Plaid environment
  - [ ] `createLinkToken(userId): Promise<linkToken>`
  - [ ] `exchangeToken(userId, publicToken): Promise<void>`
  - [ ] `getAccounts(userId): Promise<Account[]>`
  - [ ] `getTransactions(userId, accountId): Promise<Transaction[]>`

- [ ] Create Cloud Function for transaction syncing:
  ```typescript
  export const syncBankTransactions = functions
    .https.onCall(async (data, context) => {
      const { userId, accountId } = data;
      
      // Get transactions from Plaid
      const transactions = await plaid.getTransactions(userId, accountId);
      
      // Create expenses in Firestore
      for (const txn of transactions) {
        const expense = {
          amount: Math.abs(txn.amount),
          description: txn.name,
          category: mapPlaidCategory(txn.personal_finance_category),
          date: new Date(txn.date),
          paymentMethod: 'bank_transfer',
          source: 'plaid',
          plaidTransactionId: txn.transaction_id,
        };
        
        await createExpense(userId, expense);
      }
    });
  ```

#### 3.2 Bank Connection UI
- [ ] Create `apps/webview/src/components/BankConnectionModal.tsx`:
  - [ ] Plaid Link integration
  - [ ] Connect bank account button
  - [ ] Show connected accounts
  - [ ] Disconnect option
  - [ ] Auto-sync toggle

- [ ] Create `apps/webview/src/app/settings/connected-accounts/page.tsx`:
  - [ ] List connected bank accounts
  - [ ] Transaction sync history
  - [ ] Sync frequency selector
  - [ ] Disconnect account button

#### 3.3 Transaction Matching
- [ ] Create `packages/shared/utils/transactionMatch.ts`:
  ```typescript
  export const matchBankTransaction = (
    bankTxn: BankTransaction,
    expenses: Expense[]
  ): Expense | null => {
    // Try to match bank transaction with existing expense
    // Check: date, amount, description similarity
  };

  export const deduplicateTransactions = (
    expenses: Expense[]
  ): Expense[] => {
    // Remove duplicate expenses from manual + bank import
  };
  ```

- [ ] Show matched transactions in expense list with visual indicator

---

### Phase 4: AI-Powered Features (Week 3)

#### 4.1 Automatic Categorization
- [ ] Create `packages/shared/utils/autoCategory.ts`:
  ```typescript
  export const suggestCategory = (expenseDescription: string): string => {
    // Use simple keyword matching first
    // Later: ML model for categorization
    
    const keywords = {
      'food': ['restaurant', 'cafe', 'lunch', 'dinner', 'grocery', 'pizza'],
      'transport': ['uber', 'taxi', 'gas', 'parking', 'bus', 'train'],
      // ... more categories
    };
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(w => description.toLowerCase().includes(w))) {
        return category;
      }
    }
    return 'other';
  };

  export const improveCategories = (expenses: Expense[]) => {
    // Use user's historical categorization to train model
  };
  ```

- [ ] Update expense form:
  - [ ] Show auto-suggested category (user can override)
  - [ ] Learn from user corrections
  - [ ] Improve suggestions over time

#### 4.2 Intelligent Alerts
- [ ] Create `packages/shared/utils/intelligentAlerts.ts`:
  ```typescript
  export const generateSmartAlerts = (expenses: Expense[], budgets: Budget[]) => {
    return [
      // Anomaly alerts
      {
        type: 'unusual_spending',
        message: 'You spent $250 on groceries today, 3x your usual',
        severity: 'warning',
      },
      // Pattern alerts
      {
        type: 'pattern_alert',
        message: 'You tend to overspend on dining out on weekends',
        severity: 'info',
      },
      // Budget alerts
      {
        type: 'budget_alert',
        message: 'Food category at 85% of monthly budget',
        severity: 'warning',
      },
    ];
  };
  ```

- [ ] Show alerts in dashboard
- [ ] Dismissible with "learn more" option

#### 4.3 Spending Recommendations
- [ ] Create smart suggestions:
  ```typescript
  export const getSmartSuggestions = (user: User, expenses: Expense[]) => {
    return [
      {
        type: 'savings',
        title: 'Save on dining',
        description: 'You could save $150/month by reducing restaurant visits',
        action: 'View tips',
      },
      {
        type: 'goal',
        title: 'Set a savings goal',
        description: 'You have extra budget in transport. Consider a goal.',
        action: 'Create goal',
      },
    ];
  };
  ```

#### 4.4 Fraud Detection (ML Placeholder)
- [ ] Create `packages/shared/utils/fraudDetection.ts`:
  - [ ] Placeholder for ML model integration
  - [ ] Check for duplicate transactions
  - [ ] Flag unusual locations
  - [ ] Monitor for suspicious patterns

---

### Phase 5: Testing & Deployment (Week 3-4)

#### 5.1 Unit Tests
- [ ] Test shared budget calculations
- [ ] Test settlement algorithm
- [ ] Test analytics functions
- [ ] Test recommendation engine
- [ ] Aim for 80%+ coverage

#### 5.2 Integration Tests
- [ ] Test shared budget workflows:
  - [ ] Create → Invite → Accept → Add Expense → Calculate Settlement
  - [ ] Remove member → Recalculate balances
  - [ ] Edit shared expense → Update settlements

- [ ] Test analytics with sample data
- [ ] Test Plaid integration (sandbox)

#### 5.3 E2E Tests
- [ ] Cypress tests for user flows:
  - [ ] Full shared budget user journey
  - [ ] Analytics dashboard interaction
  - [ ] Recommendation acceptance workflow

#### 5.4 Load Testing
- [ ] Test with large shared budgets (50+ members, 1000+ expenses)
- [ ] Test concurrent updates
- [ ] Monitor Firestore usage

---

## 📦 Dependencies to Install

```bash
# Shared budgets & collaboration
npm install --workspace=apps/webview zustand # For client-side state

# AI/ML (optional/placeholder)
npm install --workspace=apps/webview simple-statistics

# Bank integration (Plaid - optional)
npm install --workspace=apps/webview plaid-link-web

# Email service (for invitations)
npm install --workspace=packages/firebase nodemailer firebase-admin

# Testing
npm install --save-dev --workspace=apps/webview cypress
```

---

## 🏗️ File Structure Updates

```
apps/webview/src/
├── app/
│   ├── shared-budgets/
│   │   ├── page.tsx (NEW)
│   │   └── [id]/page.tsx (NEW)
│   └── settings/
│       └── connected-accounts/page.tsx (NEW)
│
├── components/
│   ├── InviteMembersModal.tsx (NEW)
│   ├── MembersPanel.tsx (NEW)
│   ├── ExpenseSplitter.tsx (NEW)
│   ├── RecommendationsCard.tsx (NEW)
│   ├── BankConnectionModal.tsx (NEW)
│   └── ActivityTimeline.tsx (NEW)

packages/firebase/
├── services/
│   ├── sharedBudgets.ts (NEW)
│   ├── members.ts (NEW)
│   ├── activityLog.ts (NEW)
│   └── plaid.ts (NEW - optional)

packages/shared/
└── utils/
    ├── settlement.ts (NEW)
    ├── patterns.ts (NEW)
    ├── optimization.ts (NEW)
    ├── forecast.ts (NEW)
    ├── benchmarking.ts (NEW)
    ├── autoCategory.ts (NEW)
    ├── intelligentAlerts.ts (NEW)
    ├── fraudDetection.ts (NEW)
    └── transactionMatch.ts (NEW)
```

---

## 🎯 Advanced Algorithms

### Settlement Optimization Algorithm
```typescript
// Minimize number of transactions for settlement
// Example: Instead of A→B, A→C, B→C
// Optimize to: A→C, B→C (fewer transactions)

function optimizeSettlement(debts: Debt[]): Settlement[] {
  // Algorithm: Graph-based settlement optimization
  // 1. Create balance matrix
  // 2. Use iterative algorithm to minimize transactions
  // 3. Return optimal settlement path
}
```

### Spending Pattern Detection
```typescript
// Detect if spending significantly differs from baseline
function isAnomalous(amount: number, category: string, history: Expense[]): boolean {
  const categoryExpenses = history.filter(e => e.category === category);
  const mean = calculateMean(categoryExpenses);
  const stdDev = calculateStdDev(categoryExpenses);
  
  return Math.abs(amount - mean) > 2 * stdDev; // 2σ threshold
}
```

---

## ✅ Milestone 4 Completion Checklist

- [ ] Shared budgets creation and management working
- [ ] Member invitations sending via email
- [ ] Expense splitting calculations correct
- [ ] Settlement amounts calculated properly
- [ ] Shared budget pages fully functional
- [ ] Spending pattern analysis implemented
- [ ] Recommendations generating correctly
- [ ] Forecast predictions reasonable
- [ ] Plaid integration functional (if implemented)
- [ ] Bank transaction matching working
- [ ] Auto-categorization suggesting categories
- [ ] Smart alerts triggering appropriately
- [ ] All unit tests passing (>80% coverage)
- [ ] Integration tests for shared budgets passing
- [ ] E2E tests for major flows passing
- [ ] Load testing completed
- [ ] No console errors or warnings

---

## 📞 Handoff Notes for Next Developer

When starting Milestone 4:

1. **Prerequisite:**
   - Ensure Milestone 3 is fully completed
   - All Firestore indexes from M3 deployed

2. **Architecture Note:**
   - Shared budgets require careful transaction management
   - Settlement algorithm is critical - test thoroughly
   - Consider race conditions when multiple users update simultaneously

3. **Priority Order:**
   - Week 1: Shared budgets (core feature)
   - Week 2: Analytics insights + Plaid (optional)
   - Week 3: AI features + Testing
   - Week 4: Optimization + Deployment

4. **Complex Areas:**
   - **Settlement Calculation:** Test with edge cases (uneven splits, debt cycles)
   - **Real-time Sync:** Use Firestore listeners for live updates on shared budgets
   - **Permission System:** Carefully validate ownership/role before operations
   - **Email Invitations:** Test email delivery, handle bounces

5. **Cloud Function Debugging:**
   - Use `firebase emulators:start` for local testing
   - Monitor logs in Firebase Console for production issues

6. **Performance Considerations:**
   - Index queries: budgets by member, expenses by sharedBudgetId
   - Pagination for activity logs (don't load all at once)
   - Cache settlement calculations (don't recalculate on every page load)

---

**Last Updated:** December 15, 2025  
**Created By:** FundTrack Development Team
