'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useCategories, useAddCategory, useDeleteCategory } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories(user?.uid || null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    color: '#8b5cf6',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const { mutate: addCategory } = useAddCategory(user?.uid || '');
  const { mutate: deleteCategory } = useDeleteCategory(user?.uid || '');

  // Popular emoji options
  const emojiOptions = [
    '🍔', '🚗', '🎥', '🏠', '💪', '🛍️',
    '✈️', '🏥', '📚', '🎮', '⚽', '🎵',
    '💼', '🧳', '🎓', '🏋️', '🍕', '☕',
    '💻', '📱', '🎁', '🌮', '🍜', '🥗',
  ];

  const colorOptions = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Gold', value: '#d4af37' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a category name');
      return;
    }
    if (formData.name.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }
    if (formData.name.trim().length > 30) {
      setError('Category name must be less than 30 characters');
      return;
    }

    // Check if category already exists
    if (categories.some((cat) => cat.name.toLowerCase() === formData.name.toLowerCase())) {
      setError('This category already exists');
      return;
    }

    try {
      setIsSubmitting(true);
      addCategory({
        name: formData.name.trim(),
        icon: formData.icon,
        color: formData.color,
      });

      // Reset form
      setFormData({
        name: '',
        icon: '📁',
        color: '#8b5cf6',
      });
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create category. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate default and custom categories
  const defaultCategories = categories.filter((cat) => cat.isDefault);
  const customCategories = categories.filter((cat) => !cat.isDefault);

  // Show loading state if user not loaded
  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-[#d4af37]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/dashboard"
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Expense Categories</h1>
            <p className="text-gray-400">Manage your default and custom categories</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/50 transition-all"
          >
            {showCreateForm ? '✕ Cancel' : '+ New Category'}
          </button>
        </div>

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="mb-8 bg-[#1a1530]/50 border border-[#8b5cf6]/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Create New Category</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-semibold text-[#d4af37] mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Groceries, Entertainment"
                  maxLength={30}
                  className="w-full px-4 py-3 bg-[#0f0a1a] border border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.name.length}/30 characters
                </p>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#d4af37] mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, icon: emoji }))}
                      className={`p-3 rounded-lg border-2 transition-all text-2xl ${
                        formData.icon === emoji
                          ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                          : 'border-[#8b5cf6]/30 hover:border-[#8b5cf6]/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#d4af37] mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color: colorOption.value }))
                      }
                      className={`p-4 rounded-lg border-3 transition-all ${
                        formData.color === colorOption.value
                          ? 'border-white'
                          : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: colorOption.value }}
                      title={colorOption.name}
                    >
                      {formData.color === colorOption.value && (
                        <span className="text-white font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/30">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{
                    backgroundColor: `${formData.color}20`,
                    borderColor: formData.color,
                    borderWidth: '2px',
                  }}
                >
                  <span className="text-2xl">{formData.icon}</span>
                  <span>{formData.name || 'Category Name'}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#8b5cf6]/30 text-[#d4af37] font-semibold hover:bg-[#8b5cf6]/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-semibold hover:shadow-lg hover:shadow-[#8b5cf6]/50 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Default Categories */}
        {defaultCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">Default Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 rounded-lg bg-[#1a1530]/50 border border-[#8b5cf6]/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{category.name}</p>
                      <p className="text-xs text-gray-400">Default Category</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">Custom Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 rounded-lg bg-[#1a1530]/50 border border-[#8b5cf6]/20 flex items-center justify-between group hover:border-[#8b5cf6]/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <p className="text-white font-semibold">{category.name}</p>
                      <p className="text-xs text-gray-400">Custom Category</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete category"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {defaultCategories.length === 0 && customCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No categories found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white font-semibold"
            >
              Create your first category
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-12 p-4 rounded-lg bg-[#8b5cf6]/5 border border-[#8b5cf6]/30">
          <h3 className="text-sm font-semibold text-[#d4af37] mb-2">💡 Tips</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Default categories are pre-set and cannot be deleted</li>
            <li>• Custom categories can be created and deleted anytime</li>
            <li>• Categories are used to organize your expenses and budgets</li>
            <li>• Deleting a custom category will not affect existing expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
