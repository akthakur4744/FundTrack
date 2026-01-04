'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAuth, useExpenses, useBudgets, useCategories } from '@fundtrack/firebase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

type DateRange = 'today' | 'week' | 'month' | 'year' | 'all';

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: allExpenses = [] } = useExpenses(user?.uid || null);
  const { data: budgetsList = [] } = useBudgets(user?.uid || null);
  const { data: categories = [] } = useCategories(user?.uid || null);
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // Calculate date ranges
  const getDateRange = (range: DateRange) => {
    const start = new Date();
    const end = new Date();
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'all':
        return { start: new Date(0), end };
    }
    
    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange(dateRange);

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= rangeStart && expDate <= rangeEnd;
    });
  }, [allExpenses, rangeStart, rangeEnd]);

  // Calculate total and group by category
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const spendingByCategory = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredExpenses.forEach(exp => {
      grouped[exp.category] = (grouped[exp.category] || 0) + exp.amount;
    });
    return Object.entries(grouped)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        icon: categories.find(c => c.name === category)?.icon || '📁',
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories]);

  // Prepare data for monthly trend (line chart)
  const monthlyData = useMemo(() => {
    const data: { [key: string]: number } = {};
    const today = new Date();
    
    // Get last 12 months or fewer based on date range
    let monthsToShow = 12;
    if (dateRange === 'today') monthsToShow = 1;
    else if (dateRange === 'week') monthsToShow = 1;
    else if (dateRange === 'month') monthsToShow = 1;
    else if (dateRange === 'year') monthsToShow = 12;

    // Initialize months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      data[key] = 0;
    }

    // Fill in actual spending
    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const key = expDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (key in data) {
        data[key] += exp.amount;
      }
    });

    return Object.entries(data).map(([month, amount]) => ({
      month,
      amount: parseFloat(amount.toFixed(2)),
    }));
  }, [filteredExpenses, dateRange]);

  // Budget vs Actual comparison
  const budgetComparison = useMemo(() => {
    return budgetsList
      .map(budget => {
        const spent = filteredExpenses
          .filter(exp => exp.category === budget.category)
          .reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
          category: budget.category,
          budget: budget.limit,
          spent,
          remaining: Math.max(0, budget.limit - spent),
          percentage: Math.min(100, Math.round((spent / budget.limit) * 100)),
          status: spent > budget.limit ? 'over' : spent > budget.limit * 0.8 ? 'warning' : 'good',
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [budgetsList, filteredExpenses]);

  // Top spending categories
  const topCategories = spendingByCategory.slice(0, 5);

  // Color palette for charts
  const chartColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#d4af37'];

  // Calculate insights
  const insights = useMemo(() => {
    const insights: string[] = [];

    if (totalExpenses === 0) {
      insights.push('No expenses recorded in this period');
    } else {
      // Trend analysis
      if (monthlyData.length >= 2) {
        const currentMonth = monthlyData[monthlyData.length - 1]?.amount || 0;
        const previousMonth = monthlyData[monthlyData.length - 2]?.amount || 0;
        if (previousMonth > 0) {
          const change = ((currentMonth - previousMonth) / previousMonth) * 100;
          if (change > 10) {
            insights.push(`📈 Spending increased ${change.toFixed(0)}% compared to last month`);
          } else if (change < -10) {
            insights.push(`� Spending decreased ${Math.abs(change).toFixed(0)}% compared to last month`);
          }
        }
      }

      // Top category insight
      if (topCategories.length > 0) {
        const topCategory = topCategories[0];
        const percentage = ((topCategory.value / totalExpenses) * 100).toFixed(0);
        insights.push(`🏆 Top category: ${topCategory.name} (${percentage}% of total)`);
      }

      // Budget alerts
      const overBudget = budgetComparison.filter(b => b.status === 'over');
      if (overBudget.length > 0) {
        insights.push(`⚠️ ${overBudget.length} budget(s) exceeded`);
      }

      // Savings opportunity
      const totalBudget = budgetComparison.reduce((sum, b) => sum + b.budget, 0);
      if (totalBudget > 0 && totalExpenses < totalBudget) {
        const savings = totalBudget - totalExpenses;
        insights.push(`💰 You can spend $${savings.toFixed(2)} more within your budget`);
      }

      // Daily average
      const days = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
      const dailyAverage = totalExpenses / Math.max(days, 1);
      insights.push(`📊 Daily average: $${dailyAverage.toFixed(2)}`);
    }

    return insights.slice(0, 3); // Limit to 3 insights
  }, [totalExpenses, monthlyData, topCategories, budgetComparison, rangeEnd, rangeStart]);

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Background Gradient Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics 📊</h1>
            <p className="text-[#b0afc0] text-lg">Track your spending patterns and financial insights</p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 text-[#d4af37] hover:bg-[#8b5cf6]/30 transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Date Range Selector */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-600/20 to-purple-400/10 border border-purple-500/30">
          <p className="text-[#b0afc0] text-sm font-medium mb-4">Select Time Period</p>
          <div className="flex flex-wrap gap-3">
            {(['today', 'week', 'month', 'year', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === range
                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-600/50'
                    : 'bg-white/5 text-[#b0afc0] hover:bg-white/10'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : range === 'year' ? 'This Year' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Total Spending Card */}
        <div className="mb-8 p-8 rounded-xl card bg-gradient-to-br from-purple-600/30 to-purple-400/10 border-purple-500/30">
          <p className="text-[#b0afc0] text-sm font-medium mb-2">Total Spending</p>
          <h2 className="text-5xl font-bold text-white mb-4">${totalExpenses.toFixed(2)}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[#b0afc0] text-xs mb-1">Transactions</p>
              <p className="text-2xl font-bold text-[#d4af37]">{filteredExpenses.length}</p>
            </div>
            <div>
              <p className="text-[#b0afc0] text-xs mb-1">Categories</p>
              <p className="text-2xl font-bold text-[#d4af37]">{spendingByCategory.length}</p>
            </div>
            <div>
              <p className="text-[#b0afc0] text-xs mb-1">Average</p>
              <p className="text-2xl font-bold text-[#d4af37]">
                ${filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Insights */}
        {insights.length > 0 && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30">
            <p className="text-[#d4af37] font-semibold mb-4 flex items-center gap-2">
              💡 Insights
            </p>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <p key={idx} className="text-[#b0afc0] text-sm">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {filteredExpenses.length > 0 ? (
          <div className="space-y-8 mb-8">
            {/* Spending by Category - Pie Chart */}
            {spendingByCategory.length > 0 && (
              <div className="p-6 rounded-xl card bg-white/5 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Spending by Category</h3>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 min-h-80">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={spendingByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {spendingByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                          contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                          labelStyle={{ color: '#d4af37' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      {spendingByCategory.map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                            ></div>
                            <div>
                              <p className="text-white font-medium">{item.icon} {item.name}</p>
                              <p className="text-[#b0afc0] text-sm">
                                {((item.value / totalExpenses) * 100).toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                          <p className="text-[#d4af37] font-semibold">${item.value.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trend - Line Chart */}
            {monthlyData.length > 0 && (
              <div className="p-6 rounded-xl card bg-white/5 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Spending Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6/20" />
                    <XAxis dataKey="month" stroke="#b0afc0" />
                    <YAxis stroke="#b0afc0" />
                    <Tooltip
                      formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                      contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                      labelStyle={{ color: '#d4af37' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#d4af37', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Monthly Spending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Spending Categories - Bar Chart */}
            {topCategories.length > 0 && (
              <div className="p-6 rounded-xl card bg-white/5 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Top Spending Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCategories} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6/20" />
                    <XAxis
                      dataKey="name"
                      stroke="#b0afc0"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#b0afc0" />
                    <Tooltip
                      formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                      contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                      labelStyle={{ color: '#d4af37' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" name="Amount Spent" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Budget vs Actual - Comparison Table */}
            {budgetComparison.length > 0 && (
              <div className="p-6 rounded-xl card bg-white/5 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Budget vs Actual</h3>
                <div className="space-y-4">
                  {budgetComparison.map(item => (
                    <div key={item.category} className="p-4 rounded-lg bg-white/5 border border-purple-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-semibold">{item.category}</p>
                          <p className="text-[#b0afc0] text-sm">Budget: ${item.budget.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            item.status === 'over' ? 'text-red-400' :
                            item.status === 'warning' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            ${item.spent.toFixed(2)}
                          </p>
                          <p className={`text-sm ${
                            item.status === 'over' ? 'text-red-400' :
                            item.status === 'warning' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {item.percentage}%
                          </p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.status === 'over' ? 'bg-red-500' :
                            item.status === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 px-6 rounded-xl card bg-white/5 border border-purple-500/20 text-center">
            <p className="text-[#b0afc0] text-lg mb-4">No expenses in this period</p>
            <Link
              href="/expenses/new"
              className="inline-block px-6 py-3 rounded-lg bg-[#8b5cf6] text-white hover:bg-[#8b5cf6]/80 transition-all"
            >
              + Add Your First Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
