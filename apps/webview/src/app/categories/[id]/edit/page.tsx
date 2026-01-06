'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, useCategories, useUpdateCategory } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const { user } = useAuth();
  const { data: allCategories = [] } = useCategories(user?.uid || null);
  const { mutate: updateCategory, isPending } = useUpdateCategory(user?.uid || null);

  // Find the category to edit
  const category = allCategories.find(c => c.id === categoryId);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    color: '#8b5cf6',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize form with category data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color || '#8b5cf6',
      });
    }
  }, [category]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 30);
    setFormData(prev => ({ ...prev, name: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name.trim() || formData.name.length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }

    if (formData.name.length > 30) {
      setError('Category name must be less than 30 characters');
      return;
    }

    // Check for duplicates (excluding current category)
    const isDuplicate = allCategories.some(
      cat => cat.name.toLowerCase() === formData.name.toLowerCase() && cat.id !== categoryId
    );

    if (isDuplicate) {
      setError('This category already exists');
      return;
    }

    // Submit
    updateCategory(
      {
        categoryId,
        updates: {
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
        },
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            router.push('/categories');
          }, 1000);
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to update category');
        },
      }
    );
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-[#b0afc0] text-lg mb-4">Category not found</p>
            <Link
              href="/categories"
              className="text-[#8b5cf6] hover:text-[#d4af37] transition-colors"
            >
              ← Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If it's a default category, show read-only view
  if (category.isDefault) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/categories"
            className="text-[#8b5cf6] hover:text-[#d4af37] transition-colors flex items-center gap-2 mb-4"
          >
            ← Back to Categories
          </Link>
          <div className="p-8 rounded-xl card bg-white/5 border border-purple-500/20">
            <p className="text-center text-[#b0afc0] text-lg mb-4">
              Default categories cannot be edited
            </p>
            <p className="text-center text-[#8b5cf6]">
              {category.icon} {category.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/categories"
            className="text-[#8b5cf6] hover:text-[#d4af37] transition-colors flex items-center gap-2 mb-4"
          >
            ← Back to Categories
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Edit Category 📁</h1>
          <p className="text-[#b0afc0]">Customize your expense category</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
            ✓ Category updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="p-8 rounded-xl card bg-white/5 border border-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Category Name * ({formData.name.length}/30)
              </label>
              <input
                type="text"
                placeholder="e.g., Groceries"
                value={formData.name}
                onChange={handleNameChange}
                maxLength={30}
                className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/50"
              />
            </div>

            {/* Emoji Picker */}
            <div>
              <label className="block text-white font-semibold mb-4">Icon *</label>
              <div className="grid grid-cols-6 gap-2">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                    className={`p-3 rounded-lg text-2xl transition-all ${
                      formData.icon === emoji
                        ? 'bg-[#8b5cf6] border-2 border-[#d4af37] shadow-lg shadow-purple-600/50'
                        : 'bg-white/5 border-2 border-transparent hover:border-purple-500/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-white font-semibold mb-4">Color *</label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map(colorOpt => (
                  <button
                    key={colorOpt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: colorOpt.value }))}
                    className={`p-4 rounded-lg transition-all border-2 ${
                      formData.color === colorOpt.value
                        ? 'border-white shadow-lg'
                        : 'border-transparent hover:border-white/50'
                    }`}
                    style={{ backgroundColor: colorOpt.value + '40' }}
                  >
                    <div className="text-center">
                      {formData.color === colorOpt.value && (
                        <p className="text-white text-sm font-bold mb-1">✓</p>
                      )}
                      <p className="text-xs text-white font-medium">{colorOpt.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-400/10 border border-purple-500/30">
              <p className="text-[#b0afc0] text-sm mb-3">Preview</p>
              <button
                type="button"
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{
                  backgroundColor: formData.color + '60',
                  border: `2px solid ${formData.color}`,
                }}
              >
                <span className="mr-2">{formData.icon}</span>
                {formData.name || 'Category Name'}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-6 py-3 rounded-lg bg-[#8b5cf6] text-white font-semibold hover:bg-[#8b5cf6]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/50"
              >
                {isPending ? '🔄 Updating...' : '✓ Update Category'}
              </button>
              <Link
                href="/categories"
                className="flex-1 px-6 py-3 rounded-lg bg-white/5 text-[#b0afc0] hover:bg-white/10 font-semibold transition-all border border-purple-500/20"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
