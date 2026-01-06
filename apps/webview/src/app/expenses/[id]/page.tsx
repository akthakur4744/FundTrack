'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useExpensesByDateRange, useUpdateExpense, useDeleteExpense, useCategories } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

interface ExpenseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch all expenses to find the one we need
  const { data: allExpenses = [] } = useExpensesByDateRange(
    user?.uid || null,
    0,
    Date.now() + 365 * 24 * 60 * 60 * 1000 // Next year
  );

  const { data: categories = [] } = useCategories(user?.uid || null);
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense(user?.uid || '');
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense(user?.uid || '');
  
  // Find the expense
  const expense = allExpenses.find(exp => exp.id === id);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when expense data loads
  useEffect(() => {
    if (expense) {
      const expenseDate = new Date(expense.date);
      setFormData({
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description || '',
        date: expenseDate.toISOString().split('T')[0],
      });
    }
  }, [expense]);

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
      updateExpense({
        expenseId: id,
        updates: {
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: new Date(formData.date).getTime(),
        },
      });
      
      // Redirect to expenses page on success
      router.push('/expenses');
    } catch (err) {
      setError('Failed to update expense. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

    try {
      deleteExpense(id);
      router.push('/expenses');
    } catch (err) {
      setError('Failed to delete expense. Please try again.');
      console.error(err);
    }
  };

  // Show loading state
  if (!expense) {
    return (
      <div className="min-h-screen bg-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-[#d4af37]">Loading expense...</p>
        </div>
      </div>
    );
  }

  // Show user not loaded state
  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-[#d4af37]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/expenses" 
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Expenses
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Edit Expense</h1>

        {/* Error Message */}
        {error && (
          <div className="card bg-red-600/20 border-red-500/30 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#d4af37] mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting || isUpdating}
                className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[#d4af37] mb-2">
                Amount ($)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                disabled={isSubmitting || isUpdating}
                placeholder="0.00"
                className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#d4af37] mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting || isUpdating}
                placeholder="Add details about this expense..."
                rows={3}
                className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#d4af37] mb-2">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting || isUpdating}
                className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            {/* Current Expense Info */}
            {expense && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-[#b0afc0]">
                  <span className="text-[#d4af37] font-semibold">Originally Created:</span> {new Date(expense.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
