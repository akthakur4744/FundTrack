'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ExpensesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', name: 'All', count: 12 },
    { id: 'food', name: 'Food', count: 4 },
    { id: 'transport', name: 'Transport', count: 3 },
    { id: 'entertainment', name: 'Entertainment', count: 2 },
    { id: 'utilities', name: 'Utilities', count: 3 },
  ];

  const expenses = [
    {
      date: 'December 15, 2024',
      items: [
        { id: 1, icon: '🍔', name: 'Lunch at Cafe', amount: 12.5, time: '12:30 PM' },
        { id: 2, icon: '☕', name: 'Coffee', amount: 5.0, time: '10:15 AM' },
      ],
    },
    {
      date: 'December 14, 2024',
      items: [
        { id: 3, icon: '🚕', name: 'Taxi', amount: 25.0, time: '06:45 PM' },
        { id: 4, icon: '🏬', name: 'Grocery Store', amount: 87.3, time: '04:20 PM' },
        { id: 5, icon: '⛽', name: 'Gas', amount: 45.0, time: '02:15 PM' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <Link href="/expenses/new" className="btn-primary">
            + Add Expense
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Category
            </p>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-500'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-6">
          {expenses.map((group) => (
            <div key={group.date}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                {group.date}
              </h3>
              <div className="space-y-2">
                {group.items.map((expense) => (
                  <div
                    key={expense.id}
                    className="card flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{expense.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {expense.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${expense.amount.toFixed(2)}
                      </p>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}
