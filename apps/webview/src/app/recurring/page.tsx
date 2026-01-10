'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@fundtrack/firebase/hooks';
import { useRecurringExpenses, useDeleteRecurringExpense } from '@fundtrack/firebase/hooks';
import { CreateRecurringModal } from '../../components/CreateRecurringModal';
import { FREQUENCY_LABELS } from '@fundtrack/shared/schemas/recurringSchema';

export default function RecurringPage() {
  const { user } = useAuth();
  const { data: recurring = [], isLoading } = useRecurringExpenses(user?.uid || null);
  const { mutate: deleteRecurring } = useDeleteRecurringExpense(user?.uid || null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDelete = (id: string) => {
    deleteRecurring(id, {
      onSuccess: () => {
        setShowDeleteConfirm(null);
        setSuccessMessage('Recurring expense paused successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    });
  };

  // Calculate monthly total
  const monthlyTotal = recurring.reduce((sum, exp) => {
    switch (exp.frequency) {
      case 'daily':
        return sum + exp.amount * 30;
      case 'weekly':
        return sum + exp.amount * 4.33;
      case 'monthly':
        return sum + exp.amount;
      case 'yearly':
        return sum + exp.amount / 12;
      default:
        return sum;
    }
  }, 0);

  // Calculate yearly total
  const yearlyTotal = recurring.reduce((sum, exp) => {
    switch (exp.frequency) {
      case 'daily':
        return sum + exp.amount * 365;
      case 'weekly':
        return sum + exp.amount * 52;
      case 'monthly':
        return sum + exp.amount * 12;
      case 'yearly':
        return sum + exp.amount;
      default:
        return sum;
    }
  }, 0);

  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <p className="text-[#d4af37]">Loading...</p>
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/expenses" 
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Expenses
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Recurring Expenses</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            ➕ Create Recurring
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="card bg-green-600/20 border-green-500/30 mb-6">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-[#8b5cf6] mb-2">Monthly Total</p>
            <p className="text-3xl font-bold text-[#d4af37]">${monthlyTotal.toFixed(2)}</p>
            <p className="text-xs text-[#6b5b7f] mt-2">Estimated monthly spending</p>
          </div>
          <div className="card">
            <p className="text-sm text-[#8b5cf6] mb-2">Yearly Total</p>
            <p className="text-3xl font-bold text-[#d4af37]">${yearlyTotal.toFixed(2)}</p>
            <p className="text-xs text-[#6b5b7f] mt-2">Estimated yearly spending</p>
          </div>
        </div>

        {/* Recurring List */}
        {isLoading ? (
          <div className="card text-center py-8">
            <p className="text-[#8b5cf6]">Loading recurring expenses...</p>
          </div>
        ) : recurring.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[#8b5cf6] mb-4">No recurring expenses yet</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Create Your First Recurring Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recurring.map((exp) => (
              <div key={exp.id} className="card hover:border-[#d4af37]/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{exp.description}</h3>
                    <p className="text-sm text-[#8b5cf6]">{exp.category}</p>
                    <p className="text-xs text-[#6b5b7f] mt-1">
                      {FREQUENCY_LABELS[exp.frequency]} • Next: {new Date(exp.nextInstanceDue).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#d4af37]">${exp.amount.toFixed(2)}</p>
                    <p className="text-xs text-[#6b5cf6]">per {exp.frequency}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/recurring/${exp.id}`}
                      className="px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(exp.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                    >
                      Pause
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="card max-w-sm">
              <h3 className="text-xl font-bold text-white mb-4">Pause Recurring Expense?</h3>
              <p className="text-[#b0afc0] mb-6">
                This will pause the recurring expense. Past instances will remain, and no new ones will be generated.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 btn-danger"
                >
                  Pause
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateRecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setSuccessMessage('Recurring expense created successfully!')}
      />
    </div>
  );
}
