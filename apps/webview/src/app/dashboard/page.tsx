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
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Hi, John! 👋
            </h1>
            <p className="text-[#b0afc0] text-lg">Here's your financial overview</p>
          </div>
          <Link
            href="/expenses/new"
            className="btn-primary"
          >
            + Add Expense
          </Link>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Balance */}
          <div className="card bg-gradient-to-br from-purple-600/30 to-purple-400/10 border-purple-500/30 group hover:border-purple-500/60 transition-all">
            <p className="text-[#b0afc0] text-sm font-medium mb-2">Total Balance</p>
            <h2 className="text-4xl font-bold text-white mb-2">${balance.toFixed(2)}</h2>
            <p className="text-[#d4af37] text-sm">✓ Account Balance</p>
          </div>

          {/* Budget Status */}
          <div className="card bg-gradient-to-br from-purple-500/30 to-purple-400/10 border-[#d4af37]/30 group hover:border-[#d4af37]/60 transition-all">
            <p className="text-[#b0afc0] text-sm font-medium mb-2">Budget Used</p>
            <h2 className="text-4xl font-bold text-white mb-2">${spent.toFixed(2)} / ${monthlyBudget}</h2>
            <div className="w-full bg-[#2d1f45] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-[#d4af37]"
                style={{ width: `${Math.round((spent / monthlyBudget) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[#d4af37] text-sm mt-2">{Math.round((spent / monthlyBudget) * 100)}% of monthly</p>
          </div>

          {/* Spent Today */}
          <div className="card bg-gradient-to-br from-purple-600/30 to-[#d4af37]/5 border-[#d4af37]/30 group hover:border-[#d4af37]/60 transition-all">
            <p className="text-[#b0afc0] text-sm font-medium mb-2">Spent Today</p>
            <h2 className="text-4xl font-bold text-white mb-2">${spentToday.toFixed(2)}</h2>
            <p className="text-[#d4af37] text-sm">📊 Daily spending</p>
          </div>
        </div>

        {/* Recent Transactions & Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Recent Transactions
                </h3>
                <Link
                  href="/expenses"
                  className="text-[#d4af37] hover:text-[#f4d46a] transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-4 bg-[#2d1f45]/50 hover:bg-[#2d1f45] border border-[#3d2e5f]/50 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{transaction.icon}</span>
                      <div>
                        <p className="font-semibold text-white">
                          {transaction.name}
                        </p>
                        <p className="text-sm text-[#b0afc0]">
                          {transaction.time}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold text-lg ${
                        transaction.amount < 0
                          ? 'text-red-400'
                          : 'text-green-400'
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
              <h3 className="text-2xl font-bold text-white mb-6">
                Budget Overview
              </h3>
              <div className="space-y-6">
                {budgets.map((budget) => (
                  <div key={budget.category}>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-semibold text-white">
                        {budget.category}
                      </p>
                      <p className={`text-sm font-bold ${
                        budget.percentage > 100
                          ? 'text-red-400'
                          : budget.percentage > 80
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }`}>
                        {budget.percentage}%
                      </p>
                    </div>
                    <div className="w-full bg-[#2d1f45] rounded-full h-3 overflow-hidden border border-[#3d2e5f]">
                      <div
                        className={`h-full ${
                          budget.percentage > 100
                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                            : budget.percentage > 80
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                              : 'bg-gradient-to-r from-green-500 to-green-400'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#b0afc0] mt-2">
                      ${budget.spent} / ${budget.limit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
