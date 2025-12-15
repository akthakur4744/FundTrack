# FundTrack Development - Milestone 2: Firebase & Backend Integration 📋 PLANNED

**Status:** Not Started  
**Target Duration:** 4-6 weeks  
**Repository:** https://github.com/akthakur4744/FundTrack

---

## 🎯 Milestone 2 Objectives

Integrate Firebase backend services, implement authentication flows, and connect all frontend pages to real data sources using React Query and Redux.

## 📋 Detailed Task Breakdown

### Phase 1: Firebase Setup & Authentication (Week 1-2)

#### 1.1 Firebase Project Configuration
- [ ] Set up Firebase project on Firebase Console
- [ ] Enable Firestore database (production mode)
- [ ] Configure Firebase authentication providers:
  - [ ] Email/Password
  - [ ] Google OAuth
  - [ ] Apple Sign-In (iOS)
- [ ] Set up Cloud Storage for receipts
- [ ] Configure Firebase security rules
- [ ] Create `.env.local` from `.env.example`
- [ ] Add Firebase credentials to environment variables

#### 1.2 Firebase SDK Integration
- [ ] Create `packages/firebase/config/firebase.ts`:
  - [ ] Initialize Firebase app
  - [ ] Export db, auth, storage instances
  - [ ] Set up offline persistence
- [ ] Update `packages/firebase/auth.ts`:
  - [ ] Sign up with email/password
  - [ ] Login with email/password
  - [ ] Google OAuth integration
  - [ ] Apple OAuth integration
  - [ ] Password reset flow
  - [ ] Email verification
  - [ ] Logout functionality
  - [ ] Token refresh logic

#### 1.3 Authentication Pages Integration
- [ ] **Login Page** (`/auth/login`)
  - [ ] Connect to Firebase auth
  - [ ] Handle email/password login
  - [ ] Implement Google OAuth button
  - [ ] Implement Apple OAuth button
  - [ ] Error handling and validation
  - [ ] Loading state during auth
  - [ ] Redirect to dashboard on success

- [ ] **Sign Up Page** (`/auth/signup`)
  - [ ] Connect to Firebase auth
  - [ ] Create user account
  - [ ] Store user profile in Firestore
  - [ ] Send email verification
  - [ ] Handle errors (existing email, weak password)
  - [ ] Redirect to verification screen or dashboard

- [ ] **Forgot Password Page** (`/auth/forgot-password`)
  - [ ] Send password reset email
  - [ ] Handle email validation
  - [ ] Error handling for non-existent emails

#### 1.4 Redux Authentication Integration
- [ ] Update `apps/webview/src/store/index.ts`:
  - [ ] Create auth thunks:
    - [ ] `loginAsync`
    - [ ] `signupAsync`
    - [ ] `logoutAsync`
    - [ ] `resetPasswordAsync`
  - [ ] Handle auth state:
    - [ ] user object
    - [ ] isLoading
    - [ ] error
    - [ ] token
  - [ ] Create selectors:
    - [ ] `selectUser`
    - [ ] `selectAuthLoading`
    - [ ] `selectAuthError`
    - [ ] `selectIsAuthenticated`
  - [ ] Set up JWT token management

### Phase 2: Firestore Data Layer (Week 2-3)

#### 2.1 Database Schema Implementation
- [ ] Create `packages/firebase/services/expenses.ts`:
  - [ ] `addExpense(userId, expenseData): Promise<ExpenseId>`
  - [ ] `updateExpense(userId, expenseId, data): Promise<void>`
  - [ ] `deleteExpense(userId, expenseId): Promise<void>`
  - [ ] `getExpense(userId, expenseId): Promise<Expense>`
  - [ ] `getExpensesByDateRange(userId, startDate, endDate): Query`
  - [ ] `getExpensesByCategory(userId, category): Query`

- [ ] Create `packages/firebase/services/budgets.ts`:
  - [ ] `addBudget(userId, budgetData): Promise<BudgetId>`
  - [ ] `updateBudget(userId, budgetId, data): Promise<void>`
  - [ ] `deleteBudget(userId, budgetId): Promise<void>`
  - [ ] `getBudget(userId, budgetId): Promise<Budget>`
  - [ ] `getAllBudgets(userId): Query`
  - [ ] `getBudgetByCategory(userId, category): Promise<Budget>`

- [ ] Create `packages/firebase/services/categories.ts`:
  - [ ] `addCategory(userId, categoryData): Promise<CategoryId>`
  - [ ] `updateCategory(userId, categoryId, data): Promise<void>`
  - [ ] `deleteCategory(userId, categoryId): Promise<void>`
  - [ ] `getAllCategories(userId): Query`
  - [ ] `getDefaultCategories(): Promise<Category[]>`

- [ ] Create `packages/firebase/services/users.ts`:
  - [ ] `createUserProfile(userId, userData): Promise<void>`
  - [ ] `updateUserProfile(userId, userData): Promise<void>`
  - [ ] `getUserProfile(userId): Promise<User>`
  - [ ] `updateUserPreferences(userId, preferences): Promise<void>`

#### 2.2 Firebase Hooks Implementation
- [ ] `packages/firebase/hooks/useAuth.ts`:
  - [ ] Return user, loading, error
  - [ ] Handle auth state listener

- [ ] `packages/firebase/hooks/useExpenses.ts`:
  - [ ] Query expenses for current user
  - [ ] Filter by date range
  - [ ] Filter by category
  - [ ] Sorting options
  - [ ] Real-time listener setup

- [ ] `packages/firebase/hooks/useBudgets.ts`:
  - [ ] Query budgets for current user
  - [ ] Real-time updates
  - [ ] Calculate spent vs budget

- [ ] `packages/firebase/hooks/useCategories.ts`:
  - [ ] Query user categories
  - [ ] Fall back to defaults
  - [ ] Real-time sync

- [ ] `packages/firebase/hooks/useMutations.ts`:
  - [ ] `useAddExpense` mutation
  - [ ] `useUpdateExpense` mutation
  - [ ] `useDeleteExpense` mutation
  - [ ] `useAddBudget` mutation
  - [ ] `useUpdateBudget` mutation
  - [ ] `useDeleteBudget` mutation

#### 2.3 Firestore Security Rules
- [ ] Create comprehensive security rules:
  - [ ] User scoped data access
  - [ ] Prevent unauthorized reads
  - [ ] Prevent unauthorized writes
  - [ ] Validate data types
  - [ ] Enforce field requirements

### Phase 3: Pages Integration (Week 3-4)

#### 3.1 Dashboard Page Enhancement
- [ ] Connect to `useAuth` hook
- [ ] Connect to `useBudgets` hook
- [ ] Connect to `useExpenses` hook
- [ ] Display real user data
- [ ] Calculate balance and totals
- [ ] Show real recent transactions
- [ ] Implement pull-to-refresh

#### 3.2 Expenses List Integration
- [ ] Connect to `useExpenses` hook
- [ ] Implement real filtering by category
- [ ] Implement real sorting
- [ ] Implement deletion with confirmation
- [ ] Implement edit functionality
- [ ] Add pagination/infinite scroll
- [ ] Show empty state when no expenses

#### 3.3 Add/Edit Expense Integration
- [ ] Use React Hook Form for form management
- [ ] Connect `useAddExpense` mutation
- [ ] Connect `useUpdateExpense` mutation
- [ ] Validate input with Zod schemas
- [ ] Handle file upload for receipts
- [ ] Show loading and success states
- [ ] Redirect to expenses list on success
- [ ] Implement optimistic updates

#### 3.4 Budget Management Integration
- [ ] Connect to `useBudgets` hook
- [ ] Calculate actual spending per category
- [ ] Show real budget vs spent
- [ ] Implement add budget functionality
- [ ] Implement edit/delete functionality
- [ ] Add budget alert logic (80% threshold)
- [ ] Show alerts on dashboard

#### 3.5 Reports & Analytics
- [ ] Implement date range selector
- [ ] Create real data aggregation
- [ ] Implement category breakdown
- [ ] Calculate daily/monthly averages
- [ ] Implement chart library (Recharts or Chart.js)
- [ ] Show spending trends
- [ ] Implement export to CSV
- [ ] Implement export to PDF

#### 3.6 Settings Page Integration
- [ ] Connect to `useUserProfile` hook
- [ ] Implement profile update
- [ ] Implement password change
- [ ] Implement preference updates
- [ ] Connect notification preferences to backend

### Phase 4: Advanced Features (Week 4-5)

#### 4.1 Offline Support
- [ ] Implement Firestore offline persistence
- [ ] Add sync status indicator
- [ ] Queue mutations when offline
- [ ] Sync when connection returns
- [ ] Handle conflicts gracefully

#### 4.2 Real-time Sync
- [ ] Set up real-time listeners
- [ ] Handle connection state
- [ ] Update UI on remote changes
- [ ] Implement optimistic updates
- [ ] Handle update conflicts

#### 4.3 Receipt Upload & Storage
- [ ] Implement image upload to Cloud Storage
- [ ] Store receipt URLs in Firestore
- [ ] Implement receipt gallery
- [ ] Add OCR placeholder for receipt text

#### 4.4 Notifications
- [ ] Set up Firebase Cloud Messaging
- [ ] Implement budget alerts
- [ ] Implement daily digest emails
- [ ] Implement notification preferences

### Phase 5: Testing & Polish (Week 5-6)

#### 5.1 Unit Tests
- [ ] Test Firebase service functions
- [ ] Test Zod schemas
- [ ] Test Redux slices
- [ ] Test utility functions
- [ ] Aim for 80%+ coverage

#### 5.2 Integration Tests
- [ ] Test authentication flow
- [ ] Test expense CRUD operations
- [ ] Test budget creation and updates
- [ ] Test filtering and sorting
- [ ] Test data validation

#### 5.3 E2E Tests (Cypress)
- [ ] Test complete user journey:
  - [ ] Sign up → Create expense → View reports
  - [ ] Login → Add budget → Check alerts
  - [ ] Settings → Change preferences

#### 5.4 Performance Optimization
- [ ] Optimize Firestore queries
- [ ] Implement query caching
- [ ] Add database indexing
- [ ] Optimize bundle size
- [ ] Profile and optimize renders

#### 5.5 Documentation
- [ ] Document API layer
- [ ] Document Redux store structure
- [ ] Write setup guide for Firebase
- [ ] Document deployment process

## 🗄️ Firebase Firestore Structure

```
Firestore Collections:

users/
├── {userId}
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── preferences: {
│   │   currency: "USD",
│   │   theme: "dark",
│   │   language: "en",
│   │   notifications: true,
│   │   timezone: "UTC"
│   ├── }
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

expenses/
├── {userId}/
│   ├── {expenseId}
│   │   ├── amount: number
│   │   ├── currency: string
│   │   ├── category: string
│   │   ├── description: string
│   │   ├── date: timestamp
│   │   ├── paymentMethod: string
│   │   ├── receiptUrl: string (optional)
│   │   ├── tags: array
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp

budgets/
├── {userId}/
│   ├── {budgetId}
│   │   ├── category: string
│   │   ├── amount: number
│   │   ├── currency: string
│   │   ├── period: "monthly" | "yearly"
│   │   ├── startDate: timestamp
│   │   ├── alertThreshold: number (default: 80)
│   │   ├── isActive: boolean
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp

categories/
├── {userId}/
│   ├── {categoryId}
│   │   ├── name: string
│   │   ├── icon: string (emoji)
│   │   ├── color: string (hex)
│   │   ├── isDefault: boolean
│   │   ├── isActive: boolean
│   │   ├── order: number
│   │   └── createdAt: timestamp
```

## 📦 New Dependencies to Install

```bash
# Zod is already installed, these are additional:
npm install --workspace=packages/firebase \
  firebase-admin \
  date-fns

npm install --workspace=apps/webview \
  recharts \
  @headlessui/react \
  @heroicons/react
```

## 🚀 Deployment Checklist

- [ ] Firebase project deployed
- [ ] Firestore security rules deployed
- [ ] Environment variables configured
- [ ] Cloud Storage configured for images
- [ ] Cloud Functions deployed (if needed)
- [ ] Email templates configured

## ⚠️ Important Notes

- All queries must be user-scoped for security
- Always validate input with Zod before writing
- Implement proper error boundaries
- Use React Query for caching and sync
- Implement proper loading and error states
- Always check `doc.metadata.hasPendingWrites` when offline
- Test Firestore rules locally before deploying

## 📞 Handoff Notes for Next Developer

When starting Milestone 2:

1. **First 30 minutes:**
   - Clone the repo: `git clone https://github.com/akthakur4744/FundTrack.git`
   - Install dependencies: `npm install`
   - Read this document thoroughly
   - Review `.github/copilot-instructions.md` for architecture overview

2. **Firebase Setup:**
   - Create Firebase project
   - Enable Firestore, Auth, Storage
   - Copy credentials to `.env.local`
   - Create base security rules

3. **Start with Phase 1:**
   - Begin Firebase SDK integration
   - Follow the task checklist
   - Create services layer before hooks
   - Test each piece independently

4. **Use existing code:**
   - All page layouts are ready
   - Redux store structure is in place
   - All types are defined in `@fundtrack/shared`
   - All schemas are validated with Zod

---

**Last Updated:** December 15, 2025  
**Created By:** FundTrack Development Team
