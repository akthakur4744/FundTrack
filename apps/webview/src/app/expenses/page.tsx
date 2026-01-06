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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Get all expenses for the user
  const { data: allExpenses = [] } = useExpenses(user?.uid || null);
  
  // Get all categories
  const { data: categoriesList = [] } = useCategories(user?.uid || null);
  
  // Delete mutation
  const { mutate: deleteExpense } = useDeleteExpense(user?.uid || '');

  // Apply all filters
  let filteredExpenses = allExpenses;

  // Category filter
  if (selectedCategory !== 'all') {
    filteredExpenses = filteredExpenses.filter(exp => exp.category === selectedCategory);
  }

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredExpenses = filteredExpenses.filter(exp =>
      exp.description?.toLowerCase().includes(query) ||
      exp.category.toLowerCase().includes(query)
    );
  }

  // Amount range filter
  if (minAmount) {
    const min = parseFloat(minAmount);
    filteredExpenses = filteredExpenses.filter(exp => exp.amount >= min);
  }
  if (maxAmount) {
    const max = parseFloat(maxAmount);
    filteredExpenses = filteredExpenses.filter(exp => exp.amount <= max);
  }

  // Date range filter
  if (startDate) {
    const start = new Date(startDate).getTime();
    filteredExpenses = filteredExpenses.filter(exp => exp.date >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filteredExpenses = filteredExpenses.filter(exp => exp.date <= end.getTime());
  }

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

  const totalFiltered = sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const hasFiltersActive = selectedCategory !== 'all' || searchQuery || minAmount || maxAmount || startDate || endDate;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
  };

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
          <div>
            <h1 className="text-3xl font-bold text-white">Expenses</h1>
            {hasFiltersActive && (
              <p className="text-sm text-[#d4af37]">
                Showing {sortedExpenses.length} of {allExpenses.length} expenses • Total: ${totalFiltered.toFixed(2)}
              </p>
            )}
          </div>
          <Link href="/expenses/new" className="btn-primary">
            + Add Expense
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search expenses by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 rounded-lg font-medium transition-all ${
              showAdvancedFilters
                ? 'bg-[#8b5cf6] text-white'
                : 'bg-[#2d1f45] text-[#b0afc0] border border-[#3d2e5f] hover:border-[#8b5cf6]'
            }`}
          >
            ⚙️ Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="card mb-6">
            <h3 className="text-sm font-semibold text-[#d4af37] mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount Range */}
              <div>
                <label className="block text-xs font-medium text-[#b0afc0] mb-2">Min Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-3 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#b0afc0] mb-2">Max Amount ($)</label>
                <input
                  type="number"
                  placeholder="999999.99"
                  step="0.01"
                  min="0"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-3 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-medium text-[#b0afc0] mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-3 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#b0afc0] mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-3 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="mt-4 w-full px-4 py-2 bg-[#2d1f45] text-[#b0afc0] rounded-lg border border-[#3d2e5f] hover:text-white transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="mb-6">
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
        <div className="mb-6 flex gap-4 items-center">
          <p className="text-sm font-medium text-[#b0afc0]">
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
                            {expense.description || 'No description'}
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
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="text-[#8b5cf6] hover:text-[#d4af37] transition-colors"
                          title="Edit"
                        >
                          ✎
                        </Link>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-[#b0afc0] hover:text-red-400 transition-colors"
                          title="Delete"
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
              <p className="text-lg mb-4">
                {hasFiltersActive ? 'No expenses match your filters' : 'No expenses yet'}
              </p>
              <Link href="/expenses/new" className="text-[#d4af37] hover:text-[#f4d46a]">
                {hasFiltersActive ? 'Clear filters or add new expense →' : 'Add your first expense →'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
