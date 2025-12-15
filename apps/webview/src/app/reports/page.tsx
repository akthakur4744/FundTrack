'use client';

export default function ReportsPage() {
  const categoryData = [
    { name: 'Food', amount: 450, percentage: 35, icon: '🍔' },
    { name: 'Home', amount: 325, percentage: 25, icon: '🏠' },
    { name: 'Transport', amount: 260, percentage: 20, icon: '🚗' },
    { name: 'Entertainment', amount: 195, percentage: 15, icon: '🎥' },
    { name: 'Other', amount: 65, percentage: 5, icon: '📌' },
  ];

  const topCategories = categoryData.slice(0, 3);
  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Reports & Analytics</h1>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {['This Week', 'This Month', 'This Year', 'Custom'].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'This Month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-500'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Summary Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg. Daily</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(totalSpent / 30).toFixed(2)}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">47</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spending by Category
            </h2>
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${cat.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Categories
            </h2>
            <div className="space-y-4">
              {topCategories.map((cat, idx) => (
                <div key={cat.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                      <span className="text-lg">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {cat.percentage}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${cat.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spending Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending Trend
          </h2>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            <p>📊 Chart visualization coming soon...</p>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex gap-3">
          <button className="btn-secondary">📥 Export as CSV</button>
          <button className="btn-secondary">📄 Export as PDF</button>
          <button className="btn-secondary">📤 Share Report</button>
        </div>
      </div>
    </div>
  );
}
