'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth, useExpenses, useBudgets } from '@fundtrack/firebase';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: allExpenses = [] } = useExpenses(user?.uid || null);
  const { data: budgetsList = [] } = useBudgets(user?.uid || null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || 'User',
    bio: 'Financial enthusiast tracking expenses',
    timezone: 'UTC-5',
    joinDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to Firebase
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Upload to Firebase Storage
      console.log('Avatar file:', file);
    }
  };

  // Calculate statistics
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseCount = allExpenses.length;
  const budgetCount = budgetsList.length;
  const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-[#0f0a1a]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-[#d4af37]">Loading...</p>
        </div>
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/settings" 
          className="text-[#d4af37] hover:text-[#e5c158] transition-colors mb-6 inline-flex items-center gap-2"
        >
          ← Back to Settings
        </Link>

        {/* Profile Card */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleAvatarClick}
                className="relative group"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d4af37] flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-purple-600/50 group-hover:shadow-purple-600/70 transition-shadow">
                  {user?.displayName?.[0] || 'U'}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">📷</span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-[#b0afc0] mt-2">Click to upload</p>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#d4af37] mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleChange}
                      className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#d4af37] mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#d4af37] mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={profileData.timezone}
                      onChange={handleChange}
                      className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-2 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    >
                      <option value="UTC-12">UTC-12 (Baker Island)</option>
                      <option value="UTC-11">UTC-11 (Pago Pago)</option>
                      <option value="UTC-10">UTC-10 (Hawaii)</option>
                      <option value="UTC-9">UTC-9 (Anchorage)</option>
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC-7">UTC-7 (Mountain Time)</option>
                      <option value="UTC-6">UTC-6 (Central Time)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC-4">UTC-4 (Atlantic Time)</option>
                      <option value="UTC+0">UTC+0 (London)</option>
                      <option value="UTC+1">UTC+1 (Paris)</option>
                      <option value="UTC+2">UTC+2 (Cairo)</option>
                      <option value="UTC+5:30">UTC+5:30 (India)</option>
                      <option value="UTC+8">UTC+8 (Hong Kong)</option>
                      <option value="UTC+9">UTC+9 (Tokyo)</option>
                      <option value="UTC+10">UTC+10 (Sydney)</option>
                      <option value="UTC+12">UTC+12 (New Zealand)</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 btn-primary"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{profileData.displayName}</h1>
                  <p className="text-[#b0afc0] mb-3 text-sm">{profileData.bio}</p>
                  <div className="space-y-1 text-sm text-[#b0afc0]">
                    <p>📧 <span className="text-white">{user?.email}</span></p>
                    <p>🕐 <span className="text-white">{profileData.timezone}</span></p>
                    <p>📅 Joined <span className="text-white">{profileData.joinDate}</span></p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 btn-primary"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Expenses */}
          <div className="card bg-gradient-to-br from-purple-600/30 to-purple-400/10 border-purple-500/30">
            <p className="text-sm text-[#b0afc0] mb-2">Total Expenses</p>
            <h2 className="text-3xl font-bold text-white mb-1">${totalExpenses.toFixed(2)}</h2>
            <p className="text-xs text-[#d4af37]">Across {expenseCount} transactions</p>
          </div>

          {/* Average Expense */}
          <div className="card bg-gradient-to-br from-[#d4af37]/30 to-yellow-400/10 border-yellow-500/30">
            <p className="text-sm text-[#b0afc0] mb-2">Average Expense</p>
            <h2 className="text-3xl font-bold text-[#d4af37] mb-1">${averageExpense.toFixed(2)}</h2>
            <p className="text-xs text-[#b0afc0]">Per transaction</p>
          </div>

          {/* Budgets Active */}
          <div className="card bg-gradient-to-br from-green-600/30 to-green-400/10 border-green-500/30">
            <p className="text-sm text-[#b0afc0] mb-2">Active Budgets</p>
            <h2 className="text-3xl font-bold text-green-400 mb-1">{budgetCount}</h2>
            <p className="text-xs text-[#b0afc0]">Budget categories</p>
          </div>
        </div>

        {/* Account Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[#d4af37] mb-4">📊 Account Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#1a0f2e] rounded-lg border border-[#3d2e5f]">
              <div>
                <p className="font-medium text-white">Last Login</p>
                <p className="text-xs text-[#b0afc0]">Just now</p>
              </div>
              <span className="text-2xl">🟢</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#1a0f2e] rounded-lg border border-[#3d2e5f]">
              <div>
                <p className="font-medium text-white">Account Status</p>
                <p className="text-xs text-[#b0afc0]">Active & Verified</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#1a0f2e] rounded-lg border border-[#3d2e5f]">
              <div>
                <p className="font-medium text-white">Data Synced</p>
                <p className="text-xs text-[#b0afc0]">All devices synchronized</p>
              </div>
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
