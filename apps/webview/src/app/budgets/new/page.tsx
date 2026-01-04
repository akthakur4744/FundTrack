'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useAddBudget, useCategories } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function NewBudgetPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'yearly',
    currency: 'USD',
    notifications: true,
    notificationThreshold: 80,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get categories from Firebase
  const { data: categories = [] } = useCategories(user?.uid || null);

  // Add budget mutation
  const { mutate: addBudget } = useAddBudget(user?.uid || '');

  // Currency options
  const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'range') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
    if (!formData.period) {
      setError('Please select a budget period');
      return;
    }

    try {
      setIsSubmitting(true);
      addBudget({
        category: formData.category,
        limit: parseFloat(formData.limit),
        period: formData.period,
        currency: formData.currency,
        notifications: formData.notifications,
        notificationThreshold: formData.notificationThreshold,
      });

      // Redirect to budgets page on success
      router.push('/budgets');
    } catch (err) {
      setError('Failed to add budget. Please try again.');
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/budgets"
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Budgets
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Budget</h1>
          <p className="text-gray-400">Set spending limits for your expense categories</p>
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
              Category to Budget
            </label>
            {categories.length === 0 ? (
              <p className="text-gray-400">Loading categories...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.name }))}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      formData.category === cat.name
                        ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#d4af37]'
                        : 'border-[#8b5cf6]/30 text-gray-300 hover:border-[#8b5cf6]/60 hover:bg-[#8b5cf6]/5'
                    }`}
                  >
                    <span className="text-3xl block mb-1">{cat.icon}</span>
                    <p className="text-xs font-medium">{cat.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Budget Limit */}
          <div>
            <label htmlFor="limit" className="block text-sm font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              Budget Limit
            </label>
            <div className="flex gap-3">
              {/* Currency selector */}
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="px-3 py-3 bg-[#0f0a1a] border border-[#8b5cf6]/30 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
              >
                {currencyOptions.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>

              {/* Amount input */}
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#d4af37] font-semibold">
                  {currencyOptions.find((c) => c.code === formData.currency)?.symbol}
                </span>
                <input
                  type="number"
                  id="limit"
                  name="limit"
                  value={formData.limit}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0a1a] border border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                  placeholder="Enter budget limit"
                />
              </div>
            </div>
          </div>

          {/* Period Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3 uppercase tracking-wider">
                Budget Period
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, period: 'monthly' }))}
                  className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                    formData.period === 'monthly'
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#d4af37]'
                      : 'border-[#8b5cf6]/30 text-gray-300 hover:border-[#8b5cf6]/60'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, period: 'yearly' }))}
                  className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                    formData.period === 'yearly'
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#d4af37]'
                      : 'border-[#8b5cf6]/30 text-gray-300 hover:border-[#8b5cf6]/60'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div>
              <label className="block text-sm font-semibold text-[#d4af37] mb-3 uppercase tracking-wider">
                Notifications
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, notifications: !prev.notifications }))}
                  className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors ${
                    formData.notifications ? 'bg-[#8b5cf6]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                      formData.notifications ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-gray-300">{formData.notifications ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          {/* Notification Threshold Slider */}
          {formData.notifications && (
            <div>
              <label htmlFor="threshold" className="block text-sm font-semibold text-[#d4af37] mb-3 uppercase tracking-wider">
                Alert when budget reaches {formData.notificationThreshold}%
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="threshold"
                  name="notificationThreshold"
                  value={formData.notificationThreshold}
                  onChange={handleChange}
                  min="10"
                  max="100"
                  step="10"
                  className="flex-1 h-2 bg-[#8b5cf6]/30 rounded-lg appearance-none cursor-pointer accent-[#8b5cf6]"
                />
                <div className="text-right">
                  <span className="text-[#d4af37] font-bold text-2xl">{formData.notificationThreshold}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                You'll receive a notification when your spending reaches this percentage of your budget limit.
              </p>
            </div>
          )}

          {/* Summary Card */}
          <div className="mt-8 p-4 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/30">
            <h3 className="text-sm font-semibold text-[#d4af37] mb-3">Budget Summary</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="text-white font-medium">{formData.category || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Limit:</span>
                <span className="text-white font-medium">
                  {currencyOptions.find((c) => c.code === formData.currency)?.symbol}
                  {formData.limit || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Period:</span>
                <span className="text-white font-medium capitalize">{formData.period}</span>
              </div>
              <div className="flex justify-between">
                <span>Alerts:</span>
                <span className="text-white font-medium">
                  {formData.notifications ? `At ${formData.notificationThreshold}%` : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#8b5cf6]/20">
            <Link
              href="/budgets"
              className="flex-1 px-6 py-3 rounded-lg border border-[#8b5cf6]/30 text-[#d4af37] font-semibold hover:bg-[#8b5cf6]/10 transition-all text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
