'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSharedBudget } from '@fundtrack/firebase/hooks';
import type { SharedBudgetCreate } from '@fundtrack/shared/schemas';

interface CreateSharedBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (budgetId: string) => void;
}

export function CreateSharedBudgetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSharedBudgetModalProps) {
  const router = useRouter();
  const createMutation = useCreateSharedBudget();
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<SharedBudgetCreate>>({
    name: '',
    description: '',
    category: '',
    totalBudget: 0,
    currency: 'USD',
    period: 'monthly',
    startDate: new Date(),
    endDate: undefined,
  });

  // Validate individual field
  const validateField = (name: string, value: unknown): string => {
    const fieldValue = value as string | number | Date;

    switch (name) {
      case 'name':
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          return 'Budget name is required';
        }
        if (String(fieldValue).length > 100) {
          return 'Name must be 100 characters or less';
        }
        return '';

      case 'category':
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          return 'Category is required';
        }
        return '';

      case 'totalBudget':
        if (typeof fieldValue !== 'number' || fieldValue <= 0) {
          return 'Budget amount must be greater than 0';
        }
        return '';

      case 'currency':
        if (!fieldValue || String(fieldValue).length !== 3) {
          return 'Valid currency code required (e.g., USD)';
        }
        return '';

      case 'period':
        if (fieldValue !== 'monthly' && fieldValue !== 'custom') {
          return 'Period must be monthly or custom';
        }
        return '';

      case 'endDate':
        if (formData.period === 'custom' && !fieldValue) {
          return 'End date required for custom period';
        }
        if (fieldValue && formData.startDate && new Date(fieldValue) <= new Date(formData.startDate)) {
          return 'End date must be after start date';
        }
        return '';

      default:
        return '';
    }
  };

  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: unknown = value;

    // Parse number fields
    if (name === 'totalBudget') {
      parsedValue = value ? parseFloat(value) : 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  // Handle date change
  const handleDateChange = (name: string, dateStr: string) => {
    const dateValue = new Date(dateStr);

    setFormData((prev) => ({
      ...prev,
      [name]: dateValue,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  // Handle period change - reset end date if switching to monthly
  const handlePeriodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      period: value as 'monthly' | 'custom',
      endDate: value === 'custom' ? prev.endDate : undefined,
    }));

    setErrors((prev) => ({
      ...prev,
      period: '',
      endDate: '',
    }));
  };

  // Add email to invite list
  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();

    if (!trimmedEmail) {
      setErrors((prev) => ({
        ...prev,
        emailInput: 'Email cannot be empty',
      }));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrors((prev) => ({
        ...prev,
        emailInput: 'Please enter a valid email address',
      }));
      return;
    }

    // Check for duplicates
    if (inviteEmails.includes(trimmedEmail)) {
      setErrors((prev) => ({
        ...prev,
        emailInput: 'This email is already added',
      }));
      return;
    }

    setInviteEmails([...inviteEmails, trimmedEmail]);
    setEmailInput('');
    setErrors((prev) => ({
      ...prev,
      emailInput: '',
    }));
  };

  // Remove email from invite list
  const handleRemoveEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  // Handle key press in email input
  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'description') return; // Optional field
      if (key === 'inviteEmails') return; // Handled separately
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: SharedBudgetCreate = {
      name: formData.name || '',
      description: formData.description,
      category: formData.category || '',
      totalBudget: formData.totalBudget || 0,
      currency: formData.currency || 'USD',
      period: (formData.period as 'monthly' | 'custom') || 'monthly',
      startDate: formData.startDate || new Date(),
      endDate: formData.endDate,
      inviteEmails: inviteEmails.length > 0 ? inviteEmails : undefined,
    };

    createMutation.mutate(submitData, {
      onSuccess: (budgetId) => {
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          totalBudget: 0,
          currency: 'USD',
          period: 'monthly',
          startDate: new Date(),
          endDate: undefined,
        });
        setInviteEmails([]);
        setErrors({});

        if (onSuccess) {
          onSuccess(budgetId);
        } else {
          router.push(`/shared/${budgetId}`);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3d2e5f]">
          <h2 className="text-2xl font-bold text-white">Create Shared Budget</h2>
          <button
            onClick={onClose}
            className="text-[#8b5cf6] hover:text-white transition-colors text-2xl"
            disabled={createMutation.isPending}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Budget Name */}
          <div>
            <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
              Budget Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Apartment Rent"
              value={formData.name || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                errors.name ? 'border-red-500' : 'border-[#3d2e5f]'
              }`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              placeholder="e.g., Shared expenses for the apartment"
              value={formData.description || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors"
            />
          </div>

          {/* Category and Budget Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                placeholder="e.g., Housing"
                value={formData.category || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.category ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
                Budget Amount *
              </label>
              <input
                type="number"
                name="totalBudget"
                placeholder="1000"
                min="0"
                step="0.01"
                value={formData.totalBudget || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.totalBudget ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              {errors.totalBudget && (
                <p className="text-red-400 text-sm mt-1">{errors.totalBudget}</p>
              )}
            </div>
          </div>

          {/* Currency and Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
                Currency *
              </label>
              <input
                type="text"
                name="currency"
                placeholder="USD"
                maxLength={3}
                value={formData.currency || 'USD'}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.currency ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              {errors.currency && <p className="text-red-400 text-sm mt-1">{errors.currency}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
                Period *
              </label>
              <select
                value={formData.period || 'monthly'}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.period ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              >
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Dates</option>
              </select>
              {errors.period && <p className="text-red-400 text-sm mt-1">{errors.period}</p>}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-4 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors"
            />
          </div>

          {/* End Date (only for custom period) */}
          {formData.period === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-[#8b5cf6] mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.endDate ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
            </div>
          )}

          {/* Invite Members */}
          <div className="bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4 space-y-3">
            <label className="text-sm font-medium text-[#8b5cf6]">
              Invite Members (Optional)
            </label>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="member@example.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setErrors((prev) => ({ ...prev, emailInput: '' }));
                }}
                onKeyPress={handleEmailKeyPress}
                className={`flex-1 px-4 py-2 bg-[#0a0515] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.emailInput ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#9b6cf6] text-white rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {errors.emailInput && (
              <p className="text-red-400 text-sm">{errors.emailInput}</p>
            )}

            {/* Invited Emails List */}
            {inviteEmails.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[#8b5cf6]">
                  {inviteEmails.length} member{inviteEmails.length !== 1 ? 's' : ''} to invite:
                </p>
                <div className="space-y-1">
                  {inviteEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between bg-[#0a0515] px-3 py-2 rounded-md border border-[#3d2e5f]"
                    >
                      <span className="text-sm text-white">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-[#8b5cf6] hover:text-red-400 transition-colors text-lg leading-none"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {createMutation.isError && (
            <div className="bg-red-950 border border-red-500 rounded-lg p-3">
              <p className="text-red-300 text-sm">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Failed to create shared budget'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t border-[#3d2e5f]">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 btn-primary disabled:opacity-50"
            >
              {createMutation.isPending ? '⏳ Creating...' : '✓ Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
