'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useAddExpense, useCategories } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function NewExpensePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get categories from Firebase
  const { data: categories = [] } = useCategories(user?.uid || null);

  // Add expense mutation
  const { mutate: addExpense } = useAddExpense(user?.uid || '');

  // Set default category when categories load
  const handleCategorySelect = (categoryName: string) => {
    setFormData((prev) => ({ ...prev, category: categoryName }));
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    try {
      setIsSubmitting(true);
      addExpense({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).getTime(),
      });
      
      // Redirect to expenses page on success
      router.push('/expenses');
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if user not loaded
  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-[#d4af37]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/expenses" 
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Expenses
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Add New Expense</h1>
          <p className="text-gray-400">Track your spending and stay on budget</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#1a1530]/50 border border-[#8b5cf6]/20 rounded-xl p-6 backdrop-blur-sm space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#d4af37] mb-4 uppercase tracking-wider">
              Category
            </label>
            {categories.length === 0 ? (
              <p className="text-gray-400">Loading categories...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`p-4 rounded-lg border-2 transition-all text-center font-medium ${
                      formData.category === cat.name
                        ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#d4af37]'
                        : 'border-[#8b5cf6]/30 text-gray-300 hover:border-[#8b5cf6]/60 hover:bg-[#8b5cf6]/5'
                    }`}
                  >
                    <span className="text-3xl block mb-1">{cat.icon}</span>
                    <p className="text-xs">{cat.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#d4af37] font-semibold">
                $
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 bg-[#0f0a1a] border border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-[#0f0a1a] border border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all resize-none"
              placeholder="Add a note about this expense..."
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0f0a1a] border border-[#8b5cf6]/30 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#8b5cf6]/20">
            <Link 
              href="/expenses" 
              className="flex-1 px-6 py-3 rounded-lg border border-[#8b5cf6]/30 text-[#d4af37] font-semibold hover:bg-[#8b5cf6]/10 transition-all text-center"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
