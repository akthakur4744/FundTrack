'use client';

import { useState } from 'react';
import { useSharedBudgets } from '@fundtrack/firebase/hooks';
import { CreateSharedBudgetModal } from '@/components/CreateSharedBudgetModal';
import { useAuth } from '@fundtrack/firebase/hooks';
import Link from 'next/link';

export default function SharedBudgetsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: budgets = [], isLoading, error } = useSharedBudgets();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#8b5cf6]">Please sign in to view shared budgets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a1a] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Shared Budgets</h1>
            <p className="text-[#8b5cf6]">Collaborate with others on shared expenses</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-6 py-3 font-semibold"
          >
            ➕ New Shared Budget
          </button>
        </div>

        {/* Modal */}
        <CreateSharedBudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            // Refresh will happen automatically via React Query
          }}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#8b5cf6]">⏳ Loading shared budgets...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-950 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">
              {error instanceof Error ? error.message : 'Failed to load shared budgets'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && budgets.length === 0 && (
          <div className="card border-dashed flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Shared Budgets Yet</h3>
            <p className="text-[#8b5cf6] text-center mb-6">
              Create a new shared budget to start collaborating with others on expenses
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-6 py-2 font-semibold"
            >
              Create Your First Shared Budget
            </button>
          </div>
        )}

        {/* Budgets Grid */}
        {!isLoading && budgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <Link key={budget.id} href={`/shared/${budget.id}`}>
                <div className="card hover:border-[#d4af37] cursor-pointer transition-all h-full">
                  {/* Header */}
                  <div className="mb-4 pb-4 border-b border-[#3d2e5f]">
                    <h3 className="text-xl font-bold text-white mb-1">{budget.name}</h3>
                    <p className="text-[#8b5cf6] text-sm">{budget.category}</p>
                  </div>

                  {/* Budget Info */}
                  <div className="space-y-3 mb-6">
                    {/* Amount */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b5cf6] text-sm">Budget Amount</span>
                      <span className="text-white font-semibold text-lg">
                        {budget.currency} {budget.totalBudget.toFixed(2)}
                      </span>
                    </div>

                    {/* Period */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b5cf6] text-sm">Period</span>
                      <span className="text-white capitalize">
                        {budget.period === 'custom' ? 'Custom Dates' : 'Monthly'}
                      </span>
                    </div>

                    {/* Member Count */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b5cf6] text-sm">Members</span>
                      <span className="text-white">
                        {Object.values(budget.members).filter((m) => m.status === 'active').length}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b5cf6] text-sm">Status</span>
                      <span className={`text-sm font-semibold ${budget.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {budget.isActive ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-[#3d2e5f]">
                    {budget.description && (
                      <p className="text-[#8b5cf6] text-sm mb-3 line-clamp-2">
                        {budget.description}
                      </p>
                    )}
                    <div className="text-[#8b5cf6] text-xs">
                      Created {new Date(budget.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
