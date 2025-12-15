'use client';

import Link from 'next/link';

export default function DashboardPage() {
  const balance = 5234.5;
  const spentToday = 45.23;
  const monthlyBudget = 2000;
  const spent = 1245;

  const recentTransactions = [
    { id: 1, icon: '🍔', name: 'Lunch', amount: -12.5, time: '12:30 PM' },
    { id: 2, icon: '📱', name: 'Phone Bill', amount: -45.0, time: '11:15 AM' },
    { id: 3, icon: '💰', name: 'Salary', amount: 2500, time: 'Yesterday' },
    { id: 4, icon: '🎥', name: 'Netflix', amount: -15.99, time: '2 days ago' },
  ];

  const budgets = [
    { category: 'Food', spent: 180, limit: 250, percentage: 72 },
    { category: 'Transport', spent: 120, limit: 150, percentage: 80 },
    { category: 'Entertainment', spent: 245, limit: 200, percentage: 123 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hi, John! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Here's your financial overview</p>
          </div>
          <Link
            href="/expenses/new"
            className="btn-primary"
          >
            + Add Expense
          </Link>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm opacity-90 mb-1">Balance</p>
            <h2 className="text-3xl font-bold">${balance.toFixed(2)}</h2>
            <p className="text-xs opacity-75 mt-2">Account Balance</p>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm opacity-90 mb-1">Budget Used</p>
            <h2 className="text-3xl font-bold">${spent.toFixed(2)} / ${monthlyBudget}</h2>
            <p className="text-xs opacity-75 mt-2">{Math.round((spent / monthlyBudget) * 100)}% of monthly budget</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-sm opacity-90 mb-1">Spent Today</p>
            <h2 className="text-3xl font-bold">${spentToday.toFixed(2)}</h2>
            <p className="text-xs opacity-75 mt-2">Daily spending</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Transactions
                </h3>
                <Link
                  href="/expenses"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{transaction.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.time}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.amount < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Budget Overview
              </h3>
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.category}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {budget.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {budget.percentage}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          budget.percentage > 100
                            ? 'bg-red-500'
                            : budget.percentage > 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${budget.spent} / ${budget.limit}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/budgets"
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline block"
              >
                Manage Budgets →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
