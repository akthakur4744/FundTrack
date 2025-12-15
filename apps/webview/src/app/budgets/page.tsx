'use client';

import Link from 'next/link';

export default function BudgetsPage() {
  const budgets = [
    {
      id: 1,
      category: 'Food & Dining',
      icon: '🍔',
      budget: 250,
      spent: 180,
      remaining: 70,
      percentage: 72,
    },
    {
      id: 2,
      category: 'Transport',
      icon: '🚗',
      budget: 150,
      spent: 120,
      remaining: 30,
      percentage: 80,
    },
    {
      id: 3,
      category: 'Entertainment',
      icon: '🎥',
      budget: 200,
      spent: 245,
      remaining: -45,
      percentage: 123,
    },
    {
      id: 4,
      category: 'Home & Utilities',
      icon: '🏠',
      budget: 800,
      spent: 650,
      remaining: 150,
      percentage: 81,
    },
  ];

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <button className="btn-primary">+ New Budget</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">${totalBudget.toFixed(2)}</h2>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">${totalSpent.toFixed(2)}</h2>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining</p>
            <h2
              className={`text-2xl font-bold ${
                totalRemaining >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              ${totalRemaining.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Budget List */}
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{budget.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {budget.category}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${budget.spent.toFixed(2)} / ${budget.budget.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-blue-500 transition-colors">
                  ⋮
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
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
              </div>

              {/* Info */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {budget.percentage}% used
                </p>
                <p
                  className={`text-sm font-medium ${
                    budget.remaining >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {budget.remaining >= 0
                    ? `$${budget.remaining.toFixed(2)} remaining`
                    : `$${Math.abs(budget.remaining).toFixed(2)} over`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-400">
            💡 <strong>Tip:</strong> Set realistic budgets and review them monthly to track your spending habits
            effectively.
          </p>
        </div>
      </div>
    </div>
  );
}
