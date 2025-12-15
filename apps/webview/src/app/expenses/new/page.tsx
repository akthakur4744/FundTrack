'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewExpensePage() {
  const [formData, setFormData] = useState({
    category: 'food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'credit_card',
  });

  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍔' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎥' },
    { id: 'home', name: 'Home & Utilities', icon: '🏠' },
    { id: 'health', name: 'Health & Fitness', icon: '💪' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'debit_card', name: 'Debit Card' },
    { id: 'bank_transfer', name: 'Bank Transfer' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Firebase submission
    console.log('Adding expense:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/expenses" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 block">
          ← Back to Expenses
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">New Expense</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.category === cat.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <span className="text-3xl block mb-1">{cat.icon}</span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {cat.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                className="input-field pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Add a note..."
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="input-field"
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/expenses" className="btn-secondary flex-1 text-center">
              Cancel
            </Link>
            <button type="submit" className="btn-primary flex-1">
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
