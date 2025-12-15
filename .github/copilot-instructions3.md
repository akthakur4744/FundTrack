# FundTrack Development - Milestone 3: Advanced Features & Optimization 📊 PLANNED

**Status:** Not Started  
**Target Duration:** 3-4 weeks  
**Dependency:** Completion of Milestone 2 (Firebase & Backend Integration)  
**Repository:** https://github.com/akthakur4744/FundTrack

---

## 🎯 Milestone 3 Objectives

Implement advanced analytics, receipt management, enhanced budgeting features, mobile-native integration, and performance optimization to create a more feature-rich and performant application.

---

## 📋 Detailed Task Breakdown

### Phase 1: Analytics & Reports Implementation (Week 1)

#### 1.1 Chart Library Setup
- [ ] Install Recharts: `npm install --workspace=apps/webview recharts`
- [ ] Create chart components in `packages/ui/components/`:
  - [ ] `PieChart.tsx` - Category spending breakdown
  - [ ] `LineChart.tsx` - Spending trends over time
  - [ ] `BarChart.tsx` - Monthly comparison
  - [ ] `AreaChart.tsx` - Cumulative spending

#### 1.2 Reports Page Enhancement
- [ ] Update `apps/webview/src/app/reports/page.tsx`:
  - [ ] Implement time period selector (Week/Month/Year)
  - [ ] Connect to real expenses data via `useExpenses` hook
  - [ ] Calculate aggregate spending statistics:
    - [ ] `calculateTotalSpent(expenses)` - Total for period
    - [ ] `calculateAverageDailySpent(expenses)` - Daily average
    - [ ] `calculateCategoryBreakdown(expenses)` - % by category
    - [ ] `calculateSpendingTrend(expenses)` - Daily/weekly trend
  - [ ] Render Pie Chart with real category data
  - [ ] Render Line Chart with trend data
  - [ ] Display top categories list

#### 1.3 Report Export Functionality
- [ ] Create `apps/webview/src/utils/exportReport.ts`:
  - [ ] `exportToCSV(expenses, format)` - CSV export with headers
  - [ ] `exportToPDF(reportData)` - PDF generation using jspdf + html2canvas
  - [ ] `shareReport(reportData)` - Share report via email/social
- [ ] Update Reports page:
  - [ ] Add Export button with dropdown (CSV, PDF, Email)
  - [ ] Add Share button with social options
  - [ ] Show success toast after export
  - [ ] Handle export errors

#### 1.4 Analytics Utilities
- [ ] Create `packages/shared/utils/analytics.ts`:
  ```typescript
  export const calculateSpendingByCategory = (expenses: Expense[]) => {
    // Group expenses by category, sum amounts, calculate percentages
  };
  
  export const getDailySpendingTrend = (expenses: Expense[], days: number) => {
    // Return array of {date, amount} for chart
  };
  
  export const getMonthlyComparison = (expenses: Expense[]) => {
    // Compare current month vs previous months
  };
  
  export const getTopCategories = (expenses: Expense[], limit: number) => {
    // Return top N categories by spending
  };
  
  export const getSpendingForecast = (expenses: Expense[], days: number) => {
    // Predict spending for next N days based on trends
  };
  ```

---

### Phase 2: Receipt Management (Week 1-2)

#### 2.1 Receipt Upload Setup
- [ ] Create `apps/webview/src/components/ReceiptUploader.tsx`:
  - [ ] File input for image selection
  - [ ] Preview uploaded image
  - [ ] Drag & drop support
  - [ ] File validation (type, size < 5MB)
  - [ ] Progress indicator during upload
  - [ ] Error handling for failed uploads

#### 2.2 Cloud Storage Integration
- [ ] Update `packages/firebase/services/storage.ts`:
  - [ ] `uploadReceipt(userId, expenseId, file): Promise<url>`
    - [ ] Organize files: `receipts/{userId}/{expenseId}/{filename}`
    - [ ] Set expiration policy (30 days for temp, permanent for linked)
    - [ ] Return download URL
  - [ ] `deleteReceipt(userId, expenseId): Promise<void>`
  - [ ] `getReceiptURL(userId, expenseId): Promise<url>`

#### 2.3 Expense Integration
- [ ] Update `apps/webview/src/app/expenses/new/page.tsx`:
  - [ ] Integrate `<ReceiptUploader />` component
  - [ ] Upload receipt when expense is saved
  - [ ] Store receipt URL in Firestore expense document
  - [ ] Show upload status during form submission
  - [ ] Allow removing receipt from form

#### 2.4 Receipt Gallery
- [ ] Create `apps/webview/src/app/expenses/[id]/page.tsx`:
  - [ ] Display single expense details
  - [ ] Show receipt image (if available)
  - [ ] Lightbox/modal for fullscreen view
  - [ ] Download receipt button
  - [ ] Delete receipt button
  - [ ] Edit expense data

#### 2.5 OCR Setup (Optional - Phase 1)
- [ ] Research OCR solutions:
  - [ ] Google Cloud Vision API
  - [ ] Tesseract.js (client-side)
  - [ ] AWS Textract
- [ ] Create `apps/webview/src/utils/ocr.ts` (placeholder)
  - [ ] `extractTextFromReceipt(imageFile): Promise<text>`
  - [ ] `extractAmountFromReceipt(text): number`
  - [ ] `extractDateFromReceipt(text): Date`

---

### Phase 3: Advanced Budgeting Features (Week 2)

#### 3.1 Recurring Expenses
- [ ] Update Firestore schema to support recurring:
  ```typescript
  interface RecurringExpense extends Expense {
    isRecurring: true;
    recurrencePattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    recurrenceEndDate?: Date;
    recurrenceCount?: number;
    nextOccurrenceDate: Date;
  }
  ```

- [ ] Create `packages/firebase/services/recurring.ts`:
  - [ ] `createRecurringExpense(userId, expenseData): Promise<id>`
  - [ ] `updateRecurringExpense(userId, id, data): Promise<void>`
  - [ ] `deleteRecurringExpense(userId, id): Promise<void>`
  - [ ] `generateNextOccurrence(recurring): Expense` - Create instance of recurring

- [ ] Create React hook `packages/firebase/hooks/useRecurringExpenses.ts`:
  - [ ] Fetch all recurring expenses
  - [ ] Generate instances for current month
  - [ ] Include in expense list

#### 3.2 Budget Alerts & Notifications
- [ ] Update `packages/firebase/services/budgets.ts`:
  - [ ] `checkBudgetStatus(userId, categoryId): {spent, budget, percentage, isExceeded}`
  - [ ] `sendBudgetAlert(userId, budgetId, percentage)` - Firebase Cloud Function

- [ ] Update `apps/webview/src/store/index.ts` (alertSlice):
  - [ ] Add alerts reducer:
    ```typescript
    interface Alert {
      id: string;
      userId: string;
      type: 'budget_alert' | 'threshold_warning' | 'overspend';
      category: string;
      percentage: number;
      message: string;
      isRead: boolean;
      createdAt: Date;
    }
    ```
  - [ ] Actions: `addAlert`, `markAlertAsRead`, `dismissAlert`

- [ ] Create `apps/webview/src/components/AlertBell.tsx`:
  - [ ] Display unread alert count
  - [ ] Show alert dropdown with list
  - [ ] Mark as read on click
  - [ ] Dismiss alert option

#### 3.3 Budget Comparison
- [ ] Create `apps/webview/src/utils/budgetComparison.ts`:
  - [ ] `compareBudgets(currentMonth, previousMonth)` - Month-over-month
  - [ ] `calculateVariance(current, previous)` - Calculate % change
  - [ ] `getTrendDirection(history)` - Up/Down/Stable

- [ ] Update Budget page `apps/webview/src/app/budgets/page.tsx`:
  - [ ] Add comparison section showing previous month
  - [ ] Show variance with up/down arrows
  - [ ] Color code increases (red) vs decreases (green)

#### 3.4 Saving Goals
- [ ] Update Firestore schema:
  ```typescript
  interface SavingGoal {
    id: string;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    category?: string;
    icon: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- [ ] Create `apps/webview/src/app/savings/page.tsx`:
  - [ ] List all saving goals with progress bars
  - [ ] Add new goal button
  - [ ] Edit/Delete goal options
  - [ ] Calculate days remaining
  - [ ] Estimate if goal is achievable

---

### Phase 4: Mobile-Native Bridge (Week 2-3)

#### 4.1 WebView ↔ React Native Communication
- [ ] Update `apps/mobile/src/components/WebViewScreen.tsx`:
  ```typescript
  // Setup message handlers
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const { type, payload } = JSON.parse(event.nativeEvent.data);
    
    switch(type) {
      case 'REQUEST_CAMERA':
        // Launch native camera
        break;
      case 'REQUEST_BIOMETRIC':
        // Trigger biometric auth
        break;
      case 'OPEN_CAMERA_ROLL':
        // Open photo library
        break;
    }
  };
  ```

- [ ] Create WebView postMessage utility in `apps/webview/src/utils/nativeBridge.ts`:
  ```typescript
  export const sendToNative = (type: string, payload?: any) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type, payload })
      );
    }
  };
  ```

#### 4.2 Camera Integration
- [ ] Install: `npx expo install expo-camera expo-image-picker`

- [ ] Create native module `apps/mobile/src/services/camera.ts`:
  - [ ] `launchCamera(): Promise<image>`
  - [ ] `pickFromGallery(): Promise<image>`
  - [ ] `uploadImage(uri): Promise<url>` - Upload to Firebase

- [ ] Update expense form to use native camera:
  - [ ] Detect if running in native app
  - [ ] Use native camera for receipt photos
  - [ ] Fall back to web file input

#### 4.3 Biometric Authentication
- [ ] Install: `npx expo install expo-local-authentication`

- [ ] Create `apps/mobile/src/services/biometric.ts`:
  - [ ] `isBiometricAvailable(): Promise<boolean>`
  - [ ] `authenticate(): Promise<boolean>`
  - [ ] Store biometric preference in device storage

- [ ] Update login flow:
  - [ ] Check if biometric is available after first login
  - [ ] Offer to enable biometric
  - [ ] Use biometric for fast login on app resume

#### 4.4 Native Notifications
- [ ] Install: `npx expo install expo-notifications`

- [ ] Create `apps/mobile/src/services/notifications.ts`:
  - [ ] Request notification permissions
  - [ ] Handle notification received
  - [ ] Handle notification tapped

- [ ] Setup Cloud Messaging integration:
  - [ ] Listen for FCM tokens
  - [ ] Store token in Firestore user document
  - [ ] Use token to send budget alerts

#### 4.5 Share Sheet
- [ ] Install: `npx expo install react-native-share`

- [ ] Update Reports page:
  - [ ] Add share button that uses native share sheet
  - [ ] Share expense report as text/file
  - [ ] Works with Messages, Email, etc.

---

### Phase 5: Performance Optimization (Week 3)

#### 5.1 Bundle Size Optimization
- [ ] Analyze bundle: `npm run build && npx webpack-bundle-analyzer`
- [ ] Code splitting:
  - [ ] Dynamic imports for routes
  - [ ] Lazy load chart libraries
  - [ ] Separate vendor bundles

- [ ] Dependencies optimization:
  - [ ] Remove unused packages
  - [ ] Use lighter alternatives (e.g., date-fns vs moment)
  - [ ] Tree-shake unused exports

#### 5.2 Image Optimization
- [ ] Update receipt images:
  - [ ] Compress on upload (ImageOptim, Squoosh)
  - [ ] Use WebP format with fallback
  - [ ] Lazy load images in galleries

- [ ] Use Next.js Image component:
  ```typescript
  import Image from 'next/image';
  
  <Image
    src={receiptUrl}
    alt="Receipt"
    width={400}
    height={600}
    quality={75}
    priority={false}
  />
  ```

#### 5.3 Database Query Optimization
- [ ] Add Firestore indexes for common queries:
  - [ ] `expenses` ordered by date (descending)
  - [ ] `expenses` filtered by userId + category
  - [ ] `expenses` filtered by userId + date range
  - [ ] `budgets` filtered by userId + category

- [ ] Implement pagination:
  - [ ] Load 20 expenses per page
  - [ ] Load more on scroll/button click
  - [ ] Use cursor-based pagination

#### 5.4 React Performance
- [ ] Implement React.memo for expensive components:
  - [ ] Chart components
  - [ ] Large lists
  - [ ] Modal/Dialog components

- [ ] Use useMemo/useCallback:
  ```typescript
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(expenses);
  }, [expenses]);
  ```

- [ ] Optimize Redux selectors (use Reselect):
  - [ ] Memoize selector outputs
  - [ ] Prevent unnecessary re-renders

#### 5.5 Caching Strategy
- [ ] React Query configuration:
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 minutes
        gcTime: 10 * 60 * 1000,        // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
      },
    },
  });
  ```

- [ ] Implement browser caching:
  - [ ] Service Worker for offline support
  - [ ] Cache static assets (images, fonts)
  - [ ] Cache API responses

#### 5.6 Lighthouse Performance
- [ ] Target scores:
  - [ ] Performance: > 90
  - [ ] Accessibility: > 90
  - [ ] Best Practices: > 90
  - [ ] SEO: > 90

- [ ] Audit and fix:
  - [ ] Run Lighthouse in DevTools
  - [ ] Address critical issues
  - [ ] Improve Core Web Vitals

---

### Phase 6: Testing (Week 3-4)

#### 6.1 Unit Tests for Analytics
- [ ] Create `apps/webview/src/utils/__tests__/analytics.test.ts`:
  - [ ] Test `calculateSpendingByCategory`
  - [ ] Test `getDailySpendingTrend`
  - [ ] Test `getMonthlyComparison`
  - [ ] Aim for 100% coverage

#### 6.2 Component Tests
- [ ] Test chart components:
  - [ ] Render with mock data
  - [ ] Handle empty data
  - [ ] Responsive behavior

- [ ] Test receipt uploader:
  - [ ] File selection
  - [ ] Validation
  - [ ] Upload progress

#### 6.3 Integration Tests
- [ ] Test end-to-end flows:
  - [ ] Add expense → Upload receipt → View in reports
  - [ ] Create recurring expense → Auto-generate instances
  - [ ] Budget alert → Receive notification

#### 6.4 Performance Tests
- [ ] Measure page load times
- [ ] Profile React renders
- [ ] Check memory usage
- [ ] Test with large datasets (1000+ expenses)

---

## 📦 Dependencies to Install

```bash
# Analytics & Charts
npm install --workspace=apps/webview recharts date-fns

# PDF Export
npm install --workspace=apps/webview jspdf html2canvas

# Mobile-specific
cd apps/mobile && npx expo install expo-camera expo-image-picker expo-local-authentication expo-notifications react-native-share

# Optional OCR (setup only, not implementation)
npm install --workspace=apps/webview tesseract.js

# Testing
npm install --save-dev --workspace=apps/webview @testing-library/react jest @testing-library/jest-dom
```

---

## 🏗️ File Structure Updates

```
apps/webview/src/
├── app/
│   ├── reports/
│   │   ├── page.tsx (UPDATED)
│   │   └── components/
│   │       ├── AnalyticsSummary.tsx (NEW)
│   │       └── ChartContainer.tsx (NEW)
│   ├── expenses/
│   │   ├── new/page.tsx (UPDATED - add receipt upload)
│   │   └── [id]/page.tsx (NEW - detail view)
│   └── savings/page.tsx (NEW)
│
├── components/
│   ├── ReceiptUploader.tsx (NEW)
│   ├── AlertBell.tsx (NEW)
│   └── charts/ (NEW)
│       ├── PieChart.tsx
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       └── AreaChart.tsx
│
└── utils/
    ├── exportReport.ts (NEW)
    ├── nativeBridge.ts (NEW)
    ├── ocr.ts (NEW - placeholder)
    └── budgetComparison.ts (NEW)

packages/firebase/
├── services/
│   ├── storage.ts (NEW)
│   └── recurring.ts (NEW)
└── hooks/
    ├── useRecurringExpenses.ts (NEW)
    └── useNotifications.ts (NEW)

packages/shared/
└── utils/
    └── analytics.ts (NEW)

apps/mobile/
├── src/
│   ├── services/
│   │   ├── camera.ts (NEW)
│   │   ├── biometric.ts (NEW)
│   │   └── notifications.ts (NEW)
│   └── components/
│       └── WebViewScreen.tsx (UPDATED)
```

---

## 🎯 Key Implementation Details

### Firebase Cloud Function for Recurring Expenses
```typescript
// functions/src/generateRecurringExpenses.ts
export const generateRecurringExpensesDaily = functions
  .pubsub.schedule('every day 00:30')
  .timeZone('UTC')
  .onRun(async (context) => {
    const recurringSnapshot = await admin
      .firestore()
      .collectionGroup('recurringExpenses')
      .where('nextOccurrenceDate', '<=', new Date())
      .get();

    for (const doc of recurringSnapshot.docs) {
      const recurring = doc.data();
      
      // Create instance of recurring expense
      const newExpense = {
        ...recurring,
        isRecurring: false,
        createdAt: new Date(),
      };

      // Add to expenses
      await doc.ref.parent.parent?.collection('expenses').add(newExpense);

      // Update next occurrence date
      const nextDate = calculateNextOccurrence(recurring);
      await doc.ref.update({ nextOccurrenceDate: nextDate });
    }
  });
```

### Budget Alert Cloud Function
```typescript
export const checkBudgetAlerts = functions
  .pubsub.schedule('every 1 hours')
  .onRun(async (context) => {
    // Get all budgets
    // Check spending vs budget for each
    // Send notifications/alerts if threshold exceeded
  });
```

---

## 🚀 Deployment Considerations

- **Cloud Functions:** Deploy recurring expense generator and alert checker
- **Firestore Indexes:** Create indexes for optimized queries
- **Cloud Storage:** Configure CORS for receipt uploads
- **Firebase Messaging:** Configure topic subscriptions for alerts

---

## ✅ Milestone 3 Completion Checklist

- [ ] All chart visualizations working with real data
- [ ] Export to CSV/PDF functional
- [ ] Receipt upload and storage working
- [ ] Recurring expenses creating instances
- [ ] Budget alerts triggering correctly
- [ ] Saving goals fully implemented
- [ ] Mobile camera integration working
- [ ] Biometric auth available on iOS/Android
- [ ] Native notifications setup complete
- [ ] Bundle size < 500KB (webview)
- [ ] Lighthouse scores > 90
- [ ] All unit tests passing (>80% coverage)
- [ ] Performance profiling completed
- [ ] No console errors or warnings

---

## 📞 Handoff Notes for Next Developer

When starting Milestone 3:

1. **Prerequisites:**
   - Ensure Milestone 2 is fully completed
   - Verify Firebase configuration is production-ready
   - Check all data is properly synced in Firestore

2. **First Task:**
   - Set up Recharts and implement pie/line charts on reports page
   - Test with real expense data

3. **Priority Order:**
   - Week 1: Analytics & Reports (highest priority)
   - Week 2: Receipt Management + Budgeting
   - Week 3: Mobile Bridge + Performance
   - Week 4: Testing & Polish

4. **Testing Focus:**
   - Chart rendering with edge cases (no data, single item)
   - Receipt upload with various file sizes
   - Biometric auth on real devices

5. **Common Pitfalls:**
   - Forgetting to add Firestore indexes (queries will be slow)
   - Not handling empty data states in charts
   - Biometric auth fallback for devices without fingerprint
   - Image compression before upload (important for UX)

---

**Last Updated:** December 15, 2025  
**Created By:** FundTrack Development Team
