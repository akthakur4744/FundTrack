'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useExpenses, useCategories, useDeleteExpense } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Get all expenses for the user
  const { data: allExpenses = [] } = useExpenses(user?.uid || null);
  
  // Get all categories
  const { data: categoriesList = [] } = useCategories(user?.uid || null);
  
  // Delete mutation
  const { mutate: deleteExpense } = useDeleteExpense(user?.uid || '');

  // Filter expenses by category
  const filteredExpenses = selectedCategory === 'all'
    ? allExpenses
    : allExpenses.filter(exp => exp.category === selectedCategory);

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.date - b.date;
      case 'highest':
        return b.amount - a.amount;
      case 'lowest':
        return a.amount - b.amount;
      case 'newest':
      default:
        return b.date - a.date;
    }
  });

  // Group expenses by date
  const groupedExpenses = sortedExpenses.reduce((groups: Record<string, typeof allExpenses>, expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  const categoryOptions = [
    { id: 'all', name: 'All', count: allExpenses.length },
    ...categoriesList.map(cat => ({
      id: cat.name,
      name: cat.name,
      count: allExpenses.filter(exp => exp.category === cat.name).length,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Expenses</h1>
          <Link href="/expenses/new" className="btn-primary">
            + Add Expense
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div>
            <p className="text-sm font-medium text-[#b0afc0] mb-2">
              Filter by Category
            </p>
            <div className="flex gap-2 flex-wrap">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#8b5cf6] text-white border border-[#8b5cf6]'
                      : 'bg-[#2d1f45] text-[#b0afc0] border border-[#3d2e5f] hover:border-[#8b5cf6]'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-sm font-medium text-[#b0afc0] mb-2">
              Sort By
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#2d1f45] text-white border border-[#3d2e5f] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
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
          {Object.entries(groupedExpenses).length > 0 ? (
            Object.entries(groupedExpenses).map(([date, expenses]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-[#b0afc0] uppercase mb-3">
                  {date}
                </h3>
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="card flex justify-between items-center hover:border-[#8b5cf6]/60 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">📝</span>
                        <div>
                          <p className="font-medium text-white">
                            {expense.description}
                          </p>
                          <p className="text-xs text-[#b0afc0]">
                            {expense.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-white">
                          ${expense.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-[#b0afc0] hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#b0afc0]">
              <p className="text-lg mb-4">No expenses yet</p>
              <Link href="/expenses/new" className="text-[#d4af37] hover:text-[#f4d46a]">
                Add your first expense →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
