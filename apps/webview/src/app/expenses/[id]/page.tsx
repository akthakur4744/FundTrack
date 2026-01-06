'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useExpensesByDateRange, useUpdateExpense, useDeleteExpense, useCategories, useUploadReceipt, useReceiptURLs, useDeleteReceipt } from '@fundtrack/firebase';

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
  
  // Receipt hooks
  const { mutate: uploadReceipt, isPending: isUploading } = useUploadReceipt();
  const { data: receiptURLs = [] } = useReceiptURLs(user?.uid || null, id);
  const { mutate: deleteReceiptMutation, isPending: isDeletingReceipt } = useDeleteReceipt();
  
  // Receipt state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find the expense
  const expense = allExpenses.find(exp => exp.id === id);
  
  // View/Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

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
      
      setSuccessMessage('Expense updated successfully!');
      setIsEditing(false);
      setError('');
      
      // Redirect to expenses page after 2 seconds
      setTimeout(() => {
        router.push('/expenses');
      }, 2000);
    } catch (err) {
      setError('Failed to update expense. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      deleteExpense(id);
      setSuccessMessage('Expense deleted successfully!');
      
      // Redirect to expenses page after 2 seconds
      setTimeout(() => {
        router.push('/expenses');
      }, 2000);
    } catch (err) {
      setError('Failed to delete expense. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
    // Reset form to current expense data
    if (expense) {
      const expenseDate = new Date(expense.date);
      setFormData({
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description || '',
        date: expenseDate.toISOString().split('T')[0],
      });
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

  // VIEW MODE
  if (!isEditing) {
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

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Expense Details</h1>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              ✏️ Edit
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="card bg-green-600/20 border-green-500/30 mb-6">
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Expense Details Card */}
          <div className="card space-y-6">
            {/* Amount - Large Display */}
            <div className="border-b border-[#3d2e5f] pb-6">
              <p className="text-sm text-[#b0afc0] mb-2">Amount</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#d4af37]">${expense.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#3d2e5f] pb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Category</p>
                <p className="text-lg text-white">{expense.category}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Date</p>
                <p className="text-lg text-white">
                  {new Date(expense.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            {expense.description && (
              <div className="border-b border-[#3d2e5f] pb-6">
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Description</p>
                <p className="text-white text-base leading-relaxed">{expense.description}</p>
              </div>
            )}

            {/* Receipt Section */}
            <div className="border-b border-[#3d2e5f] pb-6">
              <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-4">Receipt</p>
              
              {/* Upload Area */}
              <div className="mb-4">
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setSelectedFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPreviewURL(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="bg-[#1a0f2e] border-2 border-dashed border-[#3d2e5f] hover:border-[#8b5cf6] rounded-lg p-8 text-center cursor-pointer transition-colors">
                    {previewURL ? (
                      <div className="space-y-4">
                        <img 
                          src={previewURL} 
                          alt="Receipt preview" 
                          className="max-h-40 mx-auto rounded-lg object-contain"
                        />
                        <p className="text-[#8b5cf6] text-sm">{selectedFile?.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[#d4af37] text-2xl mb-2">�</p>
                        <p className="text-[#8b5cf6] text-sm">Click to select receipt image</p>
                        <p className="text-[#6b5b7f] text-xs mt-1">JPG, PNG, or WebP (max 5MB)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Upload Button */}
              {selectedFile && previewURL && (
                <button
                  onClick={() => {
                    uploadReceipt(
                      { userId: user!.uid, expenseId: id, file: selectedFile },
                      {
                        onSuccess: () => {
                          setSelectedFile(null);
                          setPreviewURL('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        },
                      }
                    );
                  }}
                  disabled={isUploading}
                  className="w-full btn-primary disabled:opacity-50 mb-4"
                >
                  {isUploading ? '⏳ Uploading...' : '✓ Upload Receipt'}
                </button>
              )}

              {/* Uploaded Receipts Grid */}
              {receiptURLs && receiptURLs.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-3">
                    {receiptURLs.length} Receipt{receiptURLs.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {receiptURLs.map((receipt, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={receipt.url}
                          alt={`Receipt ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-[#3d2e5f] hover:border-[#d4af37] transition-colors"
                        />
                        <button
                          onClick={() => {
                            deleteReceiptMutation(receipt.path);
                          }}
                          disabled={isDeletingReceipt}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="Delete receipt"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#b0afc0]">
              <div>
                <span className="text-[#8b5cf6]">Created:</span>{' '}
                {new Date(expense.date).toLocaleDateString()}
              </div>
              <div>
                <span className="text-[#8b5cf6]">ID:</span>{' '}
                <code className="text-xs bg-[#1a0f2e] px-2 py-1 rounded">{id}</code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-[#3d2e5f]">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 btn-primary"
              >
                ✏️ Edit Expense
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 btn-danger"
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="card max-w-sm">
                <h3 className="text-xl font-bold text-white mb-4">Delete Expense?</h3>
                <p className="text-[#b0afc0] mb-6">
                  Are you sure you want to delete this expense? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 btn-danger disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <button 
          onClick={cancelEdit}
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Details
        </button>

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

            {/* Current Amount Info */}
            {expense && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-[#b0afc0]">
                  <span className="text-[#d4af37] font-semibold">Original Amount:</span> ${expense.amount.toFixed(2)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-[#3d2e5f]">
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
