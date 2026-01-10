'use client';

import { useState } from 'react';
import {
  FREQUENCIES,
  FREQUENCY_LABELS,
  FREQUENCY_DESCRIPTIONS,
  DAYS_OF_WEEK,
  type RecurringExpenseCreate,
} from '@fundtrack/shared/schemas/recurringSchema';
import { useAuth, useCategories, useCreateRecurringExpense } from '@fundtrack/firebase/hooks';

interface CreateRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categories?: string[];
}

export function CreateRecurringModal({
  isOpen,
  onClose,
  onSuccess,
  categories: propCategories,
}: CreateRecurringModalProps) {
  const { user } = useAuth();
  const { data: categoriesData = [] } = useCategories(user?.uid || null);
  const categories = propCategories || categoriesData.map((c) => c.name);

  const { mutate: createRecurring, isPending } = useCreateRecurringExpense(user?.uid || null);

  // Form state
  const [formData, setFormData] = useState<Partial<RecurringExpenseCreate>>({
    frequency: 'monthly',
    currency: 'USD',
    daysOfWeek: [1, 3, 5], // Default: Mon, Wed, Fri for weekly
    dayOfMonth: 15, // Default: 15th for monthly
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Reset form when modal closes
  if (!isOpen) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev: Partial<RecurringExpenseCreate>) => ({
      ...prev,
      [name]:
        name === 'amount'
          ? parseFloat(value) || 0
          : name === 'dayOfMonth'
            ? parseInt(value, 10) || 1
            : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDayOfWeekChange = (day: number) => {
    setFormData((prev: Partial<RecurringExpenseCreate>) => {
      const current = prev.daysOfWeek || [];
      const updated = current.includes(day)
        ? current.filter((d: number) => d !== day)
        : [...current, day];
      return { ...prev, daysOfWeek: updated };
    });
  };

  // Calculate and display preview of generated instances
  const calculateInstanceCount = (): number => {
    if (!formData.startDate || !formData.endDate) {
      return 12; // Default preview: 12 instances
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    let count = 0;

    switch (formData.frequency) {
      case 'daily':
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        count = Math.min(days, 365); // Cap at 365 for preview
        break;
      case 'weekly':
        const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const daysInWeek = (formData.daysOfWeek || []).length || 1;
        count = Math.min(weeks * daysInWeek, 100);
        break;
      case 'monthly':
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        count = Math.min(months, 120);
        break;
      case 'yearly':
        count = end.getFullYear() - start.getFullYear();
        break;
    }

    return Math.max(count, 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate required fields
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.frequency === 'weekly' && (!formData.daysOfWeek || formData.daysOfWeek.length === 0)) {
      newErrors.daysOfWeek = 'Select at least one day for weekly recurrence';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      createRecurring(formData as RecurringExpenseCreate, {
        onSuccess: () => {
          // Reset form
          setFormData({
            frequency: 'monthly',
            currency: 'USD',
            daysOfWeek: [1, 3, 5],
            dayOfMonth: 15,
          });
          onSuccess?.();
          onClose();
        },
      });
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create recurring expense' });
    }
  };

  const instanceCount = calculateInstanceCount();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3d2e5f]">
          <h2 className="text-2xl font-bold text-white">Create Recurring Expense</h2>
          <button
            onClick={onClose}
            className="text-[#8b5cf6] hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#8b5cf6] mb-2">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="e.g., Netflix Subscription"
              className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Amount and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">Category *</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={
                  formData.startDate
                    ? new Date(formData.startDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  setFormData((prev: Partial<RecurringExpenseCreate>) => ({
                    ...prev,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  }));
                }}
                className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">End Date (Optional)</label>
              <input
                type="date"
                name="endDate"
                value={
                  formData.endDate
                    ? new Date(formData.endDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  setFormData((prev: Partial<RecurringExpenseCreate>) => ({
                    ...prev,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  }));
                }}
                className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-[#8b5cf6] mb-3">Frequency *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FREQUENCIES.map((freq: string) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFormData((prev: Partial<RecurringExpenseCreate>) => ({ ...prev, frequency: freq as any }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.frequency === freq
                      ? 'bg-[#d4af37] text-[#0f0a1a]'
                      : 'bg-[#1a0f2e] border border-[#3d2e5f] text-[#8b5cf6] hover:border-[#d4af37]'
                  }`}
                >
                  {FREQUENCY_LABELS[freq]}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#6b5b7f] mt-2">{FREQUENCY_DESCRIPTIONS[formData.frequency || 'monthly']}</p>
          </div>

          {/* Weekly Day Selection */}
          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-3">Days of Week *</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day: any) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayOfWeekChange(day.value)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      (formData.daysOfWeek || []).includes(day.value)
                        ? 'bg-[#d4af37] text-[#0f0a1a]'
                        : 'bg-[#1a0f2e] border border-[#3d2e5f] text-[#8b5cf6] hover:border-[#d4af37]'
                    }`}
                  >
                    {day.label.charAt(0)}
                  </button>
                ))}
              </div>
              {errors.daysOfWeek && <p className="text-red-400 text-sm mt-1">{errors.daysOfWeek}</p>}
            </div>
          )}

          {/* Monthly Day Selection */}
          {formData.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">Day of Month *</label>
              <select
                name="dayOfMonth"
                value={formData.dayOfMonth || 15}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#6b5b7f] mt-1">
                For months with fewer days, will use the last day of that month
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[#d4af37] hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {showPreview ? '▼' : '▶'} Preview: ~{instanceCount} expenses
            </button>
            {showPreview && (
              <div className="mt-3 pt-3 border-t border-[#3d2e5f] space-y-1">
                <p className="text-xs text-[#8b5cf6]">
                  First expense: {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}
                </p>
                {formData.endDate && (
                  <p className="text-xs text-[#8b5cf6]">
                    Last expense: {new Date(formData.endDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-xs text-[#8b5cf6]">
                  Frequency: {formData.frequency}
                  {formData.frequency === 'weekly' && formData.daysOfWeek?.length
                    ? ` (${(formData.daysOfWeek || []).length} days/week)`
                    : ''}
                </p>
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-[#3d2e5f]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isPending ? '⏳ Creating...' : '✓ Create Recurring'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
