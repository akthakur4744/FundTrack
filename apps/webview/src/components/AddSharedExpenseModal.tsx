'use client';

import { useState } from 'react';
import { useAddSharedExpense } from '@fundtrack/firebase';

interface AddSharedExpenseModalProps {
  budgetId: string;
  budgetCurrency: string;
  members: Array<{ id: string; displayName: string; email: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SplitAmount {
  memberId: string;
  amount: number;
}

interface FormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  paidBy: string;
  splitMethod: 'equal' | 'custom' | 'itemized';
  splitAmounts: SplitAmount[];
  items: Array<{ name: string; amount: string; assignedTo: string }>;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
  paidBy?: string;
  split?: string;
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Other',
];

export function AddSharedExpenseModal({
  budgetId,
  budgetCurrency,
  members,
  isOpen,
  onClose,
  onSuccess,
}: AddSharedExpenseModalProps) {
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    paidBy: '',
    splitMethod: 'equal',
    splitAmounts: members.map(m => ({ memberId: m.id, amount: 0 })),
    items: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemInput, setItemInput] = useState({ name: '', amount: '', assignedTo: '' });

  const { mutate: addExpense, isPending } = useAddSharedExpense(budgetId);

  const validateField = (name: string, value: unknown): string => {
    const fieldValue = value as any;

    switch (name) {
      case 'description':
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          return 'Description is required';
        }
        if (String(fieldValue).length > 200) {
          return 'Description must be 200 characters or less';
        }
        return '';

      case 'amount':
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          return 'Amount is required';
        }
        const num = parseFloat(String(fieldValue));
        if (isNaN(num) || num <= 0) {
          return 'Amount must be greater than 0';
        }
        return '';

      case 'category':
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          return 'Category is required';
        }
        return '';

      case 'date':
        if (!fieldValue) {
          return 'Date is required';
        }
        return '';

      case 'paidBy':
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          return 'Please select who paid';
        }
        return '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.description = validateField('description', formData.description);
    newErrors.amount = validateField('amount', formData.amount);
    newErrors.category = validateField('category', formData.category);
    newErrors.date = validateField('date', formData.date);
    newErrors.paidBy = validateField('paidBy', formData.paidBy);

    // Validate split
    if (formData.splitMethod === 'equal') {
      // No validation needed for equal split
    } else if (formData.splitMethod === 'custom') {
      const totalSplit = formData.splitAmounts.reduce((sum, s) => sum + (s.amount || 0), 0);
      const amount = parseFloat(formData.amount);
      if (Math.abs(totalSplit - amount) > 0.01) {
        newErrors.split = `Split amounts must equal the total (${amount})`;
      }
    } else if (formData.splitMethod === 'itemized') {
      if (formData.items.length === 0) {
        newErrors.split = 'Please add at least one item';
      }
      const totalItems = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const amount = parseFloat(formData.amount);
      if (Math.abs(totalItems - amount) > 0.01) {
        newErrors.split = `Items total must equal the expense amount (${amount})`;
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, date: value }));
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const handleSplitMethodChange = (method: 'equal' | 'custom' | 'itemized') => {
    setFormData(prev => ({
      ...prev,
      splitMethod: method,
      items: [],
      itemInput: { name: '', amount: '', assignedTo: '' },
    }));
    if (errors.split) {
      setErrors(prev => ({ ...prev, split: '' }));
    }
  };

  const handleSplitAmountChange = (memberId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setFormData(prev => ({
      ...prev,
      splitAmounts: prev.splitAmounts.map(s =>
        s.memberId === memberId ? { ...s, amount: numAmount } : s
      ),
    }));
    if (errors.split) {
      setErrors(prev => ({ ...prev, split: '' }));
    }
  };

  const handleAddItem = () => {
    if (!itemInput.name.trim()) {
      alert('Item name is required');
      return;
    }
    if (!itemInput.amount || parseFloat(itemInput.amount) <= 0) {
      alert('Item amount must be greater than 0');
      return;
    }
    if (!itemInput.assignedTo) {
      alert('Please assign the item to a member');
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: itemInput.name,
          amount: itemInput.amount,
          assignedTo: itemInput.assignedTo,
        },
      ],
    }));

    setItemInput({ name: '', amount: '', assignedTo: '' });
    if (errors.split) {
      setErrors(prev => ({ ...prev, split: '' }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare split data based on method
      let splits: Record<string, number> = {};
      let itemizedSplits: Record<string, Array<{ description: string; amount: number; quantity?: number }>> = {};
      const participants = members.map(m => m.id);

      if (formData.splitMethod === 'equal') {
        const amount = parseFloat(formData.amount);
        const perPerson = amount / members.length;
        members.forEach(m => {
          splits[m.id] = perPerson;
        });
      } else if (formData.splitMethod === 'custom') {
        formData.splitAmounts.forEach(s => {
          if (s.amount > 0) {
            splits[s.memberId] = s.amount;
          }
        });
      } else if (formData.splitMethod === 'itemized') {
        formData.items.forEach(item => {
          if (!itemizedSplits[item.assignedTo]) {
            itemizedSplits[item.assignedTo] = [];
          }
          itemizedSplits[item.assignedTo].push({
            description: item.name,
            amount: parseFloat(item.amount),
          });
        });
      }

      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: new Date(formData.date),
        paidBy: formData.paidBy,
        splittingMethod: formData.splitMethod,
        participants,
        splits: formData.splitMethod !== 'equal' ? splits : undefined,
        itemizedSplits: formData.splitMethod === 'itemized' ? itemizedSplits : undefined,
      };

      addExpense(payload, {
        onSuccess: () => {
          setFormData({
            description: '',
            amount: '',
            category: 'Food & Dining',
            date: new Date().toISOString().split('T')[0],
            paidBy: '',
            splitMethod: 'equal',
            splitAmounts: members.map(m => ({ memberId: m.id, amount: 0 })),
            items: [],
          });
          setErrors({});
          onSuccess?.();
          onClose();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a0f2e] border border-[#3d2e5f] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d2e5f] sticky top-0 bg-[#1a0f2e]">
          <h2 className="text-2xl font-bold text-white">Add Expense</h2>
          <button
            onClick={onClose}
            className="text-[#b0afc0] hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this expense for?"
              className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                errors.description ? 'border-red-500' : 'border-[#3d2e5f]'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Amount ({budgetCurrency}) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.amount ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.category ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Date & Paid By Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleDateChange}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.date ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Paid By *</label>
              <select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#1a0f2e] border rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors ${
                  errors.paidBy ? 'border-red-500' : 'border-[#3d2e5f]'
                }`}
              >
                <option value="">Select member...</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p className="text-red-500 text-sm mt-1">{errors.paidBy}</p>
              )}
            </div>
          </div>

          {/* Split Method Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">How to Split? *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSplitMethodChange('equal')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.splitMethod === 'equal'
                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-600/50'
                    : 'bg-[#2a2040] text-[#b0afc0] hover:bg-[#3a3050]'
                }`}
              >
                Equally
              </button>
              <button
                type="button"
                onClick={() => handleSplitMethodChange('custom')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.splitMethod === 'custom'
                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-600/50'
                    : 'bg-[#2a2040] text-[#b0afc0] hover:bg-[#3a3050]'
                }`}
              >
                Custom
              </button>
              <button
                type="button"
                onClick={() => handleSplitMethodChange('itemized')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.splitMethod === 'itemized'
                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-600/50'
                    : 'bg-[#2a2040] text-[#b0afc0] hover:bg-[#3a3050]'
                }`}
              >
                Itemized
              </button>
            </div>
          </div>

          {/* Split Details - Equal */}
          {formData.splitMethod === 'equal' && (
            <div className="bg-[#2a2040] border border-[#3d2e5f] rounded-lg p-4">
              <p className="text-[#b0afc0] text-sm">
                Expense will be split equally among {members.length} members
              </p>
              <p className="text-white font-medium mt-2">
                ≈ {(parseFloat(formData.amount) / members.length || 0).toFixed(2)} {budgetCurrency} each
              </p>
            </div>
          )}

          {/* Split Details - Custom */}
          {formData.splitMethod === 'custom' && (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <label className="flex-1 text-[#b0afc0] text-sm">{member.displayName}</label>
                  <input
                    type="number"
                    value={formData.splitAmounts.find(s => s.memberId === member.id)?.amount || ''}
                    onChange={e => handleSplitAmountChange(member.id, e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-24 px-3 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                  <span className="text-[#b0afc0] text-sm">{budgetCurrency}</span>
                </div>
              ))}
              {errors.split && (
                <p className="text-red-500 text-sm">{errors.split}</p>
              )}
            </div>
          )}

          {/* Split Details - Itemized */}
          {formData.splitMethod === 'itemized' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Add Items</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={itemInput.name}
                    onChange={e => setItemInput(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={handleItemKeyPress}
                    placeholder="Item name"
                    className="px-3 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                  <input
                    type="number"
                    value={itemInput.amount}
                    onChange={e => setItemInput(prev => ({ ...prev, amount: e.target.value }))}
                    onKeyPress={handleItemKeyPress}
                    placeholder="Amount"
                    step="0.01"
                    min="0"
                    className="px-3 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white placeholder-[#6b5b7f] focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                  <select
                    value={itemInput.assignedTo}
                    onChange={e => setItemInput(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="px-3 py-2 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-white focus:border-[#d4af37] focus:outline-none transition-colors text-sm"
                  >
                    <option value="">Assign to...</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c4cde] transition-colors font-medium text-sm"
                >
                  ➕ Add Item
                </button>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2 bg-[#2a2040] border border-[#3d2e5f] rounded-lg p-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-[#b0afc0] text-xs">
                          {members.find(m => m.id === item.assignedTo)?.displayName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">
                          {item.amount} {budgetCurrency}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.split && (
                <p className="text-red-500 text-sm">{errors.split}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#3d2e5f]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isPending}
              className="flex-1 px-4 py-3 bg-[#2a2040] text-[#b0afc0] rounded-lg hover:bg-[#3a3050] transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="flex-1 px-4 py-3 bg-[#d4af37] text-[#0f0a1a] rounded-lg hover:bg-[#e5c158] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting || isPending ? '⏳ Adding...' : '✓ Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
