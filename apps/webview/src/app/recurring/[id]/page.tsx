'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@fundtrack/firebase/hooks';
import {
  useRecurringExpenseById,
  useRecurringInstances,
  useDeleteRecurringExpenseHard,
} from '@fundtrack/firebase/hooks';
import { FREQUENCY_LABELS } from '@fundtrack/shared/schemas/recurringSchema';

export default function RecurringDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: recurring, isLoading } = useRecurringExpenseById(user?.uid || null, id);
  const { data: instances = [] } = useRecurringInstances(user?.uid || null, id);
  const { mutate: hardDelete } = useDeleteRecurringExpenseHard(user?.uid || null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleHardDelete = () => {
    if (!id) return;
    hardDelete(id, {
      onSuccess: () => {
        setSuccessMessage('Recurring expense and all instances deleted');
        setTimeout(() => {
          window.location.href = '/recurring';
        }, 2000);
      },
    });
  };

  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <p className="text-[#d4af37]">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <p className="text-[#d4af37]">Loading recurring expense...</p>
      </div>
    );
  }

  if (!recurring) {
    return (
      <div className="min-h-screen bg-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-red-400 mb-4">Recurring expense not found</p>
          <Link href="/recurring" className="text-[#d4af37] hover:text-[#e5c158]">
            ← Back to Recurring Expenses
          </Link>
        </div>
      </div>
    );
  }

  const pastInstances = instances.filter((exp) => new Date(exp.date) < new Date());
  const futureInstances = instances.filter((exp) => new Date(exp.date) >= new Date());

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/recurring"
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Recurring Expenses
        </Link>

        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{recurring.description}</h1>
            <p className="text-[#8b5cf6]">{recurring.category}</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger whitespace-nowrap"
          >
            🗑️ Delete Series
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="card bg-green-600/20 border-green-500/30 mb-6">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Details Card */}
        <div className="card space-y-6 mb-8">
          {/* Amount & Frequency */}
          <div className="border-b border-[#3d2e5f] pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Amount</p>
                <p className="text-3xl font-bold text-[#d4af37]">${recurring.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Frequency</p>
                <p className="text-lg text-white">{FREQUENCY_LABELS[recurring.frequency]}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-lg text-white">{recurring.isActive ? 'Active' : 'Paused'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="border-b border-[#3d2e5f] pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Start Date</p>
                <p className="text-lg text-white">
                  {new Date(recurring.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {recurring.endDate && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">End Date</p>
                  <p className="text-lg text-white">
                    {new Date(recurring.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Frequency Details */}
          {recurring.frequency === 'weekly' && recurring.daysOfWeek && (
            <div className="border-b border-[#3d2e5f] pb-6">
              <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-3">Days of Week</p>
              <div className="flex flex-wrap gap-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) =>
                  recurring.daysOfWeek?.includes(idx) ? (
                    <span
                      key={day}
                      className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37]/50 rounded-full text-sm text-[#d4af37]"
                    >
                      {day}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          )}

          {recurring.frequency === 'monthly' && (
            <div className="pb-6">
              <p className="text-xs uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">Day of Month</p>
              <p className="text-lg text-white">Day {recurring.dayOfMonth}</p>
            </div>
          )}
        </div>

        {/* Instances */}
        <div className="space-y-6">
          {/* Future Instances */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Upcoming Instances ({futureInstances.length})
            </h2>
            {futureInstances.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-[#8b5cf6]">No upcoming instances</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {futureInstances.slice(0, 10).map((exp) => (
                  <div key={exp.id} className="card flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">
                        {new Date(exp.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <p className="text-[#d4af37] font-semibold">${exp.amount.toFixed(2)}</p>
                  </div>
                ))}
                {futureInstances.length > 10 && (
                  <p className="text-sm text-[#6b5b7f] text-center py-4">
                    +{futureInstances.length - 10} more upcoming
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Past Instances */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Past Instances ({pastInstances.length})
            </h2>
            {pastInstances.length === 0 ? (
              <div className="card text-center py-6">
                <p className="text-[#8b5cf6]">No past instances</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pastInstances.slice(-10).map((exp) => (
                  <div key={exp.id} className="card flex justify-between items-center opacity-75">
                    <div>
                      <p className="text-[#b0afc0] font-medium">
                        {new Date(exp.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <p className="text-[#8b5cf6] font-semibold">${exp.amount.toFixed(2)}</p>
                  </div>
                ))}
                {pastInstances.length > 10 && (
                  <p className="text-sm text-[#6b5b7f] text-center py-4">
                    +{pastInstances.length - 10} more in past
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="card max-w-sm">
              <h3 className="text-xl font-bold text-white mb-4">Delete Recurring Series?</h3>
              <p className="text-[#b0afc0] mb-6">
                This will permanently delete the recurring expense and all {instances.length} generated instances.
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-[#3d2e5f] text-white rounded-lg hover:bg-[#4d3e6f] transition-colors"
                >
                  Cancel
                </button>
                <button onClick={handleHardDelete} className="flex-1 btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
