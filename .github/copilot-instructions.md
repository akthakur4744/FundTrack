# Copilot Instructions for FundTrack

## Project Overview
**FundTrack** (formerly SPExpense) is a multi-platform expense tracking application using a single codebase with React Native shell + Next.js WebView architecture. The monorepo uses Turborepo with separate apps for mobile and web, plus shared packages for UI components, types, utilities, and Firebase configuration.

## Architecture Essentials

### The Hybrid Architecture Pattern
FundTrack uses a **React Native shell with Next.js WebView** pattern:
- **React Native (Shell):** Provides native container, navigation, and platform-specific features (biometric auth, native menus)
- **Next.js (WebView):** Delivers all application UI/logic rendered inside a WebView (`react-native-webview`)
- **Shared Packages:** Code reuse across mobile and web (`packages/ui`, `packages/shared`, `packages/firebase`)

**Key files exemplifying this:**
- `apps/mobile/src/App.tsx` - React Native entry point
- `apps/mobile/src/components/WebViewScreen.tsx` - WebView component (integration point)
- `apps/webview/src/app/layout.tsx` - Next.js root layout served in WebView
- `apps/webview/src/app/page.tsx` - Landing page accessed from mobile WebView

### Monorepo Structure (Turborepo)
```
spexpense/
├── apps/mobile/          # React Native Shell + Expo
├── apps/webview/         # Next.js 14 (served in WebView)
├── packages/
│   ├── ui/              # Shared shadcn/ui + Tailwind components
│   ├── shared/          # Types, constants, schemas, utilities
│   ├── firebase/        # Firebase config, hooks, services
│   └── config/          # ESLint, Tailwind shared configs
└── turbo.json           # Monorepo task pipeline
```

**Workspace management:** Use `turbo run build` to build all apps in dependency order. Reference `turbo.json` for task definitions.

## State Management Strategy

### Layer 1: Redux Toolkit (Global State)
Manages **persistent, user-specific state** that flows across screens:
- User authentication state
- User preferences (currency, theme, timezone)
- UI state (modals, filters, selected items)

**Convention:** Create features as Redux slices in `apps/webview/src/store/slices/` with actions, reducers, and selectors. Use `.createSlice()` for boilerplate reduction.

**Example:**
```typescript
// packages/shared/store/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
export const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoading: false },
  reducers: { setUser: (state, action) => { state.user = action.payload; } }
});
```

### Layer 2: React Query (Server State)
Manages **remote data synchronization** from Firebase:
- Expenses list with caching and pagination
- Budget data with automatic refetching
- Category definitions

**Convention:** Create custom hooks in `packages/firebase/hooks/` using `@tanstack/react-query`. Each resource (expenses, budgets) gets its own query hook with stale time and refetch intervals.

**Example:**
```typescript
// packages/firebase/hooks/useExpenses.ts
export function useExpenses() {
  return useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => fetchExpensesFromFirestore(userId),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
```

### Layer 3: Local Storage (Offline-First)
Expenses and budgets persist locally before syncing:
- SQLite (React Native) for structured data
- AsyncStorage (React Native) for metadata
- IndexedDB (Web) via browsers

**Convention:** Use Firestore offline persistence for automatic conflict-free sync. Always check `doc.metadata.hasPendingWrites` when displaying data.

## Firebase Integration Points

### Authentication Flow
1. **User Signs Up/In** → Firebase Auth (Google, Apple, Email/Password)
2. **JWT Token Stored** → Redux + AsyncStorage (mobile)
3. **Every Request Adds Auth Header** → From token in Redux store

**File:** `packages/firebase/auth.ts` - All auth logic lives here (sign up, login, refresh token, sign out)

### Firestore Data Sync
**Collection Structure** (from `PROJECT_PLAN.md`):
- `users/{userId}` - User preferences, email, display name
- `expenses/{userId}/{expenseId}` - Expense documents (amount, category, date, receiptUrl)
- `budgets/{userId}/{budgetId}` - Budget limits per category
- `categories/{userId}/{categoryId}` - Custom category definitions

**Pattern:** Queries are **user-scoped** (always filter by `userId` in WHERE clauses). Use Firestore security rules to enforce this.

**Example:**
```typescript
// Correct: Scoped to user
const expensesRef = collection(db, 'expenses', userId);
const q = query(expensesRef, where('date', '>=', startDate));
```

## Code Organization Conventions

### Type Safety (Zod + TypeScript)
All user inputs validated against Zod schemas before Firebase writes:

**Location:** `packages/shared/schemas/`
- `expenseSchema.ts` - Expense input validation
- `budgetSchema.ts` - Budget creation/update

**Usage:**
```typescript
const result = expenseSchema.parse(formData);
// If invalid, throws ZodError; app shows error toast
```

### Component Structure
- **Presentational Components** → `packages/ui/components/` (Tailwind + shadcn/ui)
  - Receive data via props, no Firebase calls
  - Responsive by default (mobile-first Tailwind)
  - Dark mode support via `className="dark:..."`

- **Container Components** → `apps/webview/src/components/` (page-level logic)
  - Fetch data via custom hooks (useExpenses, useBudgets)
  - Connect to Redux store via `useSelector`
  - Handle loading/error states

**Example:**
```typescript
// Container: apps/webview/src/components/ExpenseList.tsx
export function ExpenseList() {
  const { data: expenses, isLoading } = useExpenses();
  const filter = useSelector(state => state.ui.expenseFilter);
  const filtered = expenses?.filter(e => e.category === filter);
  return <ExpenseListUI items={filtered} loading={isLoading} />;
}

// Presentational: packages/ui/components/ExpenseListUI.tsx
export function ExpenseListUI({ items, loading }) {
  return items?.map(e => <ExpenseCard key={e.id} expense={e} />);
}
```

## Development Workflows

### Local Development (All Platforms)
```bash
# Terminal 1: Watch mode for shared packages
turbo run dev --filter="./packages/*"

# Terminal 2: Run Next.js WebView (port 3000)
cd apps/webview && npm run dev

# Terminal 3: Run React Native simulator
cd apps/mobile && npm run ios  # or: npm run android

# Optionally: Run web app standalone
cd apps/web && npm run dev
```

### Build & Test
```bash
# Build entire monorepo
turbo run build

# Test single app
cd apps/webview && npm test

# Lint code
turbo run lint

# Format code (Prettier)
turbo run format
```

### Adding Dependencies
- **Shared code:** `npm install --workspace=packages/shared` (runs from root)
- **Mobile only:** `cd apps/mobile && npm install` (native packages via Expo)
- **WebView only:** `cd apps/webview && npm install`

## Important Patterns & Anti-Patterns

### ✅ DO:
- **Query scoping:** Always include `userId` in Firestore WHERE clauses
- **Error boundaries:** Wrap page components with error boundaries (`packages/ui/ErrorBoundary.tsx`)
- **Offline support:** Check `useNetworkStatus()` hook before mutations
- **Type imports:** Use `import type { Expense }` for type-only imports (cleaner bundles)
- **Responsive images:** Use `next/image` in WebView with `fill` or explicit dimensions
- **Form validation:** Always validate input with Zod before creating/updating data

### ❌ DON'T:
- **Direct Firebase calls in UI:** Extract to custom hooks in `packages/firebase/hooks/`
- **Inline styles:** Use Tailwind classes; define reusable classes in `packages/ui/`
- **Missing error messages:** Catch Firebase errors and surface in UI toast/alert
- **Hardcoded strings:** Move to `packages/shared/constants/` (categories, currencies, etc.)
- **Mixing Redux + React Query:** Redux for UI state, React Query for server data
- **Prop drilling:** Use Redux selectors or Context for deeply nested component props

## Critical File References

| File | Purpose |
|------|---------|
| `packages/shared/types/index.ts` | Type definitions (Expense, Budget, User) |
| `packages/firebase/hooks/` | Custom hooks for Firestore/Auth |
| `packages/ui/components/` | Shared UI component library |
| `apps/webview/src/store/` | Redux slices for global state |
| `apps/mobile/src/navigation/RootNavigator.tsx` | React Navigation setup + WebView integration |
| `apps/webview/next.config.js` | Next.js WebView config (viewport, fonts) |

## Testing Conventions

- **Unit:** Jest + React Testing Library (`npm test`)
- **E2E Mobile:** Detox (in `e2e/` folder after setup)
- **E2E Web:** Cypress (in `cypress/` folder after setup)
- **Firebase Rules:** Test with Firestore emulator locally before deployment

## Deployment

- **Mobile:** EAS Build (Expo) → App Store (iOS) + Google Play (Android)
  - Config: `apps/mobile/eas.json`
- **Web (Standalone):** Vercel → `apps/web` production branch
- **WebView (Served to Mobile):** Vercel → `apps/webview` production branch
  - Mobile app points to production WebView URL via environment variable

## Key Environment Variables
All in `.env.example`:
- `NEXT_PUBLIC_FIREBASE_CONFIG` - Firebase project credentials (public)
- `FIREBASE_ADMIN_KEY` - Firebase Admin SDK key (backend only)
- `WEBVIEW_URL` - Production WebView URL (for mobile app)
- `EXPO_PUBLIC_*` - Expo-specific variables (prefixed with `EXPO_PUBLIC_` to be bundled)

---

**Last Updated:** December 15, 2025
