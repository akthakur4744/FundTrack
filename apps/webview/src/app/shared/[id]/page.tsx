'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useSharedBudgetById, useSharedExpenses } from '@fundtrack/firebase';
import { AddSharedExpenseModal } from '@/components/AddSharedExpenseModal';

type TabType = 'overview' | 'expenses' | 'balances' | 'settlements';

export default function SharedBudgetDetailPage() {
  const params = useParams();
  const budgetId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { data: budget, isLoading: budgetLoading, error: budgetError } = useSharedBudgetById(budgetId);
  const { data: expenses = [], isLoading: expensesLoading } = useSharedExpenses(budgetId);

  if (budgetLoading) {
    return (
      <div className="pl-64 pt-6 pb-20 min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <p className="text-[#b0afc0]">⏳ Loading budget...</p>
      </div>
    );
  }

  if (budgetError || !budget) {
    return (
      <div className="pl-64 pt-6 pb-20 min-h-screen bg-[#0f0a1a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-red-950 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 font-medium">
              ❌ {budgetError?.message || 'Budget not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const memberIds = Object.keys(budget.members);
  const memberCount = memberIds.length;

  // Mock member data for modal (since we don't have full user data here)
  // In production, this would come from a separate API call or be in budget.members
  const mockMembers = memberIds.map(id => ({
    id,
    displayName: `Member ${id.substring(0, 8)}`,
    email: `${id}@example.com`,
  }));

  return (
    <div className="pl-64 pt-6 pb-20 min-h-screen bg-[#0f0a1a]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{budget.name}</h1>
            <p className="text-[#b0afc0]">{budget.description || 'No description'}</p>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-6 py-3 bg-[#d4af37] text-[#0f0a1a] rounded-lg hover:bg-[#e5c158] transition-colors font-medium flex items-center gap-2"
          >
            ➕ Add Expense
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4">
            <p className="text-[#b0afc0] text-sm">Category</p>
            <p className="text-white text-lg font-semibold">{budget.category}</p>
          </div>
          <div className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4">
            <p className="text-[#b0afc0] text-sm">Budget Amount</p>
            <p className="text-[#d4af37] text-lg font-semibold">
              {budget.totalBudget.toFixed(2)} {budget.currency}
            </p>
          </div>
          <div className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4">
            <p className="text-[#b0afc0] text-sm">Period</p>
            <p className="text-white text-lg font-semibold">
              {budget.period === 'monthly' ? 'Monthly' : 'Custom'}
            </p>
          </div>
          <div className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4">
            <p className="text-[#b0afc0] text-sm">Members</p>
            <p className="text-white text-lg font-semibold">{memberCount} active</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[#3d2e5f]">
          {(['overview', 'expenses', 'balances', 'settlements'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-[#d4af37] text-[#d4af37]'
                  : 'border-transparent text-[#b0afc0] hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Budget Info */}
              <div className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Budget Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#b0afc0]">Description</span>
                    <span className="text-white">{budget.description || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b0afc0]">Created</span>
                    <span className="text-white">
                      {new Date(budget.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {budget.period === 'custom' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-[#b0afc0]">Start Date</span>
                        <span className="text-white">
                          {new Date(budget.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      {budget.endDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#b0afc0]">End Date</span>
                          <span className="text-white">
                            {new Date(budget.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">👥 Members ({memberCount})</h3>
                {memberCount > 0 ? (
                  <div className="space-y-3">
                    {memberIds.map(memberId => {
                      const memberInfo = budget.members[memberId];
                      return (
                        <div
                          key={memberId}
                          className="flex items-center justify-between p-3 bg-[#2a2040] rounded-lg"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {`Member ${memberId.substring(0, 8)}`}
                            </p>
                            <p className="text-[#b0afc0] text-sm">{memberId}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {memberInfo.status === 'active' && (
                              <span className="text-[#4ade80]">🟢 Active</span>
                            )}
                            {memberInfo.status === 'invited' && (
                              <span className="text-[#eab308]">⏳ Invited</span>
                            )}
                            {memberInfo.role === 'admin' && (
                              <span className="text-[#d4af37] text-sm">Admin</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#b0afc0] text-center py-4">No members yet</p>
                )}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              {expensesLoading ? (
                <p className="text-[#b0afc0] text-center py-8">⏳ Loading expenses...</p>
              ) : expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map(expense => (
                    <div
                      key={expense.id}
                      className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4 hover:border-[#d4af37] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{expense.description}</p>
                          <p className="text-[#b0afc0] text-sm">
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#d4af37] font-semibold">
                            {expense.amount.toFixed(2)} {budget.currency}
                          </p>
                          <p className="text-[#b0afc0] text-sm">
                            Paid by {`${expense.paidBy.substring(0, 8)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-8 text-center">
                  <p className="text-[#b0afc0]">No expenses yet</p>
                  <p className="text-[#6b5b7f] text-sm mt-2">Add the first expense to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div className="space-y-3">
              {memberCount > 0 ? (
                memberIds.map(memberId => {
                  // Calculate member's balance
                  const memberExpenses = expenses.filter(e => {
                    // Check if member is in the splits
                    return e.splits && e.splits[memberId] !== undefined;
                  });

                  const totalPaid = expenses
                    .filter(e => e.paidBy === memberId)
                    .reduce((sum, e) => sum + e.amount, 0);

                  const totalOwed = memberExpenses.reduce((sum, e) => {
                    return sum + (e.splits?.[memberId]?.amount || 0);
                  }, 0);

                  const balance = totalPaid - totalOwed;

                  return (
                    <div
                      key={memberId}
                      className="card bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-4 hover:border-[#d4af37] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">
                            {`Member ${memberId.substring(0, 8)}`}
                          </p>
                          <p className="text-[#b0afc0] text-sm">
                            Paid: {totalPaid.toFixed(2)} • Owes: {totalOwed.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          {balance > 0.01 ? (
                            <p className="text-[#4ade80] font-semibold">↓ {Math.abs(balance).toFixed(2)}</p>
                          ) : balance < -0.01 ? (
                            <p className="text-red-500 font-semibold">↑ {Math.abs(balance).toFixed(2)}</p>
                          ) : (
                            <p className="text-[#b0afc0] font-semibold">≈ Settled</p>
                          )}
                          <p className="text-[#b0afc0] text-xs">
                            {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-8 text-center">
                  <p className="text-[#b0afc0]">No members yet</p>
                </div>
              )}
            </div>
          )}

          {/* Settlements Tab */}
          {activeTab === 'settlements' && (
            <div className="bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg p-8 text-center">
              <p className="text-[#b0afc0]">Settlement history coming soon</p>
              <p className="text-[#6b5b7f] text-sm mt-2">Record and track payment settlements</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddSharedExpenseModal
        budgetId={budgetId}
        budgetCurrency={budget.currency}
        members={mockMembers}
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSuccess={() => {
          // Modal will close automatically, data refetch happens via React Query
        }}
      />
    </div>
  );
}
