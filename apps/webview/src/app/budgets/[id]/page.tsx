'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useBudgetByCategory, useUpdateBudget, useDeleteBudget } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch budget data by category ID
  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudgetByCategory(
    user?.uid || null,
    id
  );
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget(user?.uid || '');
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget(user?.uid || '');
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when budget data loads
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
      });
    }
  }, [budget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      setError('Please enter a valid budget limit');
      return;
    }

    try {
      setIsSubmitting(true);
      updateBudget({
        budgetId: id,
        updates: {
          category: formData.category,
          limit: parseFloat(formData.limit),
        },
      });
      
      // Redirect to budgets page on success
      router.push('/budgets');
    } catch (err) {
      setError('Failed to update budget. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      return;
    }

    try {
      deleteBudget(id);
      router.push('/budgets');
    } catch (err) {
      setError('Failed to delete budget. Please try again.');
      console.error(err);
    }
  };

  // Show loading state
  if (budgetLoading) {
    return (
      <div className="min-h-screen bg-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-[#d4af37]">Loading budget...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (budgetError || !budget) {
    return (
      <div className="min-h-screen bg-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link 
            href="/budgets" 
            className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
          >
            ← Back to Budgets
          </Link>
          <div className="card bg-red-600/20 border-red-500/30">
            <h2 className="text-red-400 font-semibold mb-2">Budget Not Found</h2>
            <p className="text-[#b0afc0] text-sm">
              {budgetError?.message || 'Unable to load this budget'}
            </p>
          </div>
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
          href="/budgets" 
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Budgets
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Edit Budget</h1>

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
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Budget Limit */}
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-[#d4af37] mb-2">
                Budget Limit ($)
              </label>
              <input
                id="limit"
                name="limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.limit}
                onChange={handleChange}
                disabled={isSubmitting || isUpdating}
                placeholder="0.00"
                className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            {/* Current Budget Info */}
            {budget && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-[#b0afc0]">
                  <span className="text-[#d4af37] font-semibold">Current Budget Limit:</span> $
                  {budget.limit.toFixed(2)}
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
                {isDeleting ? 'Deleting...' : 'Delete Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
