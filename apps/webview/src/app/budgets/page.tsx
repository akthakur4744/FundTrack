'use client';

import Link from 'next/link';
import { useAuth, useBudgets, useSpendingByCategory, useDeleteBudget } from '@fundtrack/firebase';

export default function BudgetsPage() {
  const { user } = useAuth();
  
  // Get all budgets for the user
  const { data: budgetsList = [] } = useBudgets(user?.uid || null);
  
  // Get current month spending
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const monthEnd = Date.now();
  
  const { data: spendingByCategory = {} } = useSpendingByCategory(
    user?.uid || null,
    monthStart,
    monthEnd
  );
  
  // Delete mutation
  const { mutate: deleteBudget } = useDeleteBudget(user?.uid || '');

  // Calculate budget details with spending
  const budgetsWithProgress = budgetsList.map(budget => {
    const spent = (spendingByCategory as Record<string, number>)[budget.category] || 0;
    const remaining = budget.limit - spent;
    const percentage = Math.round((spent / budget.limit) * 100);
    
    return {
      ...budget,
      spent,
      remaining,
      percentage,
    };
  });

  const totalBudget = budgetsList.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = Object.values(spendingByCategory).reduce((sum: number, val: unknown) => sum + ((val as number) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Budget Management</h1>
          <Link href="/budgets/new" className="btn-primary">
            + New Budget
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-purple-600/30 to-purple-400/10 border-purple-500/30">
            <p className="text-sm text-[#b0afc0] mb-1">Total Budget</p>
            <h2 className="text-2xl font-bold text-white">${totalBudget.toFixed(2)}</h2>
          </div>
          <div className="card bg-gradient-to-br from-red-600/30 to-red-400/10 border-red-500/30">
            <p className="text-sm text-[#b0afc0] mb-1">Total Spent</p>
            <h2 className="text-2xl font-bold text-red-400">${totalSpent.toFixed(2)}</h2>
          </div>
          <div className={`card bg-gradient-to-br ${totalRemaining >= 0 ? 'from-green-600/30 to-green-400/10 border-green-500/30' : 'from-red-600/30 to-red-400/10 border-red-500/30'}`}>
            <p className="text-sm text-[#b0afc0] mb-1">Remaining</p>
            <h2 className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalRemaining.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Budget List */}
        <div className="space-y-4">
          {budgetsWithProgress.length > 0 ? (
            budgetsWithProgress.map((budget) => (
              <div key={budget.id} className="card hover:border-[#8b5cf6]/60 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">📊</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {budget.category}
                      </h3>
                      <p className="text-xs text-[#b0afc0]">
                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="text-[#b0afc0] hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-[#2d1f45] rounded-full h-3 overflow-hidden border border-[#3d2e5f]">
                    <div
                      className={`h-full ${
                        budget.percentage > 100
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : budget.percentage > 80
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                            : 'bg-gradient-to-r from-green-500 to-green-400'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#b0afc0]">
                    {budget.percentage}% used
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      budget.remaining >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {budget.remaining >= 0
                      ? `$${budget.remaining.toFixed(2)} remaining`
                      : `$${Math.abs(budget.remaining).toFixed(2)} over`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#b0afc0]">
              <p className="text-lg mb-4">No budgets created yet</p>
              <Link href="/budgets/new" className="text-[#d4af37] hover:text-[#f4d46a]">
                Create your first budget →
              </Link>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-[#d4af37]">
            💡 <strong>Tip:</strong> Set realistic budgets and review them monthly to track your spending habits
            effectively.
          </p>
        </div>
      </div>
    </div>
  );
}
