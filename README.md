# 💰 FundTrack

> A seamless, multi-platform expense tracking application with real-time synchronization, budgeting tools, and financial insights.

[![React Native](https://img.shields.io/badge/React_Native-0.74%2B-61DAFB?logo=react)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-000000?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA500?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3%2B-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Overview

FundTrack is a modern expense tracking application accessible on **Web, iOS, and Android** through a single codebase. It combines the native performance of React Native with the flexibility of Next.js, enabling real-time expense management, intelligent budgeting, and comprehensive financial analytics.

### Key Features
- ✅ **Cross-Platform:** Web, iOS, and Android from one codebase
- ✅ **Real-time Sync:** Instant synchronization across all devices
- ✅ **Offline-First:** Full functionality without internet connection
- ✅ **Expense Management:** Add, categorize, and track expenses effortlessly
- ✅ **Smart Budgeting:** Set category budgets and receive alerts
- ✅ **Financial Reports:** Charts, trends, and spending insights
- ✅ **Secure Auth:** Google, Apple, and Email/Password authentication
- ✅ **Receipt OCR:** Upload and extract text from receipt images
- ✅ **Multi-Device:** Sync seamlessly across web, phone, and tablet

## 🏗️ Architecture

FundTrack uses a **React Native Shell + Next.js WebView** hybrid architecture:

```
┌─────────────────────────────────────────┐
│         React Native Shell              │
│   (Native Container & Navigation)       │
├─────────────────────────────────────────┤
│    Next.js WebView (Shared UI/Logic)    │
│   (All Application Logic & UI)          │
├─────────────────────────────────────────┤
│  Redux Toolkit | React Query | Zustand │
│        (State Management)               │
├─────────────────────────────────────────┤
│    Firebase SDK | Local Storage         │
│   (Backend & Data Persistence)          │
└─────────────────────────────────────────┘
```

### Monorepo Structure (Turborepo)
```
FundTrack/
├── apps/
│   ├── mobile/          # React Native Shell + Expo
│   ├── webview/         # Next.js 14 (served in WebView)
│   └── web/             # Standalone Next.js web app (optional)
├── packages/
│   ├── ui/              # Shared shadcn/ui + Tailwind components
│   ├── shared/          # Types, constants, schemas, utilities
│   ├── firebase/        # Firebase config, hooks, services
│   └── config/          # Shared ESLint, Tailwind configs
├── PROJECT_PLAN.md      # Comprehensive development plan
└── .github/copilot-instructions.md  # AI agent guidelines
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **Expo CLI** (for mobile development)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akthakur4744/FundTrack.git
   cd FundTrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Update .env.local with your Firebase credentials
   ```

### Development

**Terminal 1: Watch shared packages**
```bash
turbo run dev --filter="./packages/*"
```

**Terminal 2: Run Next.js WebView**
```bash
cd apps/webview && npm run dev
```

**Terminal 3: Run React Native simulator**
```bash
cd apps/mobile && npm run ios
# or for Android
cd apps/mobile && npm run android
```

### Build

```bash
# Build entire monorepo
turbo run build

# Build specific app
cd apps/webview && npm run build
```

### Testing

```bash
# Run all tests
turbo run test

# Run tests in watch mode
turbo run test -- --watch
```

## 📚 Documentation

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Comprehensive development roadmap, database schema, and UI/UX design
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Guidelines for AI coding agents
- **Deployment Guide** - Coming soon
- **API Documentation** - Coming soon

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.74+ - Native mobile shell
- **Next.js** 14+ - Web and WebView content
- **React Query** - Server state management
- **Redux Toolkit** - Global state management
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Firebase Authentication** - User authentication
- **Firestore** - Real-time database
- **Cloud Storage** - Receipt image storage
- **Cloud Functions** - Serverless business logic

### Development Tools
- **Turborepo** - Monorepo management
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Detox** - Mobile E2E testing
- **Cypress** - Web E2E testing

## 🎯 Roadmap

### Phase 1: MVP (4-6 weeks) ✅ In Progress
- Authentication (Email, Google, Apple)
- Core expense management
- Dashboard & expense list
- Basic budgeting
- Settings

### Phase 2: Advanced Features (4-6 weeks) 📋 Planned
- Analytics & reports
- Receipt OCR
- Multi-device sync
- Recurring expenses
- User profiles

### Phase 3: Premium Features (3-4 weeks) 🚀 Future
- Shared budgets
- AI-powered categorization
- Bank integrations
- Mobile widgets
- Fraud detection

## 📊 Database Schema

### Firestore Collections
```
users/{userId}
├── email, displayName, photoURL
├── preferences (currency, theme, language, timezone)
└── createdAt, updatedAt

expenses/{userId}/{expenseId}
├── amount, currency, category
├── description, date, paymentMethod
├── receiptUrl, tags
└── createdAt, updatedAt

budgets/{userId}/{budgetId}
├── category, amount, currency
├── period, startDate, endDate
├── alertThreshold, isActive
└── createdAt, updatedAt

categories/{userId}/{categoryId}
├── name, icon, color, order
├── isDefault, isActive
└── createdAt
```

## 🔐 Security

- **Authentication:** Firebase Auth with secure token management
- **Database:** Firestore security rules enforce user-scoped data access
- **Validation:** Zod schemas validate all user inputs
- **Storage:** Encrypted cloud storage for sensitive documents
- **Privacy:** No personal data shared without explicit consent

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙋 Support

- **Issues:** Report bugs or request features on [GitHub Issues](https://github.com/akthakur4744/FundTrack/issues)
- **Discussions:** Join our community at [GitHub Discussions](https://github.com/akthakur4744/FundTrack/discussions)
- **Email:** support@fundtrack.app (coming soon)

## 👥 Author

**Arun Thakur**
- GitHub: [@akthakur4744](https://github.com/akthakur4744)

---

**Made with ❤️ for better expense tracking**
