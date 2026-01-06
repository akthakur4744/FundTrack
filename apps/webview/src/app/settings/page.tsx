'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, logOut } from '@fundtrack/firebase';
import { useRouter } from 'next/navigation';

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    currency: 'USD',
    theme: 'dark',
    language: 'en',
    notifications: true,
    emailDigest: true,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccessMessage(`${key} updated to ${value}`);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#b0afc0] mb-8">Manage your account preferences and security</p>

        {/* Success Message */}
        {successMessage && (
          <div className="card bg-green-600/20 border-green-500/30 mb-6">
            <p className="text-green-400 text-sm">✓ {successMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">👤 Account</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start p-4 bg-[#1a0f2e] rounded-lg border border-[#3d2e5f]">
                <div>
                  <p className="font-medium text-white">{user?.displayName || 'User'}</p>
                  <p className="text-sm text-[#b0afc0]">{user?.email || 'No email'}</p>
                </div>
                <Link href="/profile" className="text-[#d4af37] hover:text-[#e5c158] transition-colors text-sm font-medium">
                  View Profile
                </Link>
              </div>
              <button className="w-full px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all">
                🔑 Change Password
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">⚙️ Preferences</h2>
            <div className="space-y-4">
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-[#d4af37] mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                >
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="AUD">Australian Dollar (A$)</option>
                  <option value="CAD">Canadian Dollar (C$)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-[#d4af37] mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                >
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="auto">🔄 Auto (System)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-[#d4af37] mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg px-4 py-3 text-white placeholder-[#7d6f8d] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">🔔 Notifications</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-[#1a0f2e] rounded-lg border border-[#3d2e5f]">
                <div>
                  <p className="font-medium text-white">Push Notifications</p>
                  <p className="text-xs text-[#b0afc0]">Budget alerts & reminders</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-[#8b5cf6]"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-[#1a0f2e] rounded-lg border border-[#3d2e5f]">
                <div>
                  <p className="font-medium text-white">Email Digest</p>
                  <p className="text-xs text-[#b0afc0]">Weekly spending summary</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailDigest}
                  onChange={(e) => handleChange('emailDigest', e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-[#8b5cf6]"
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">🔐 Security & Privacy</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all text-left">
                🛡️ Two-Factor Authentication
              </button>
              <button className="w-full px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all text-left">
                📱 Connected Devices
              </button>
              <button className="w-full px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all text-left">
                📋 Privacy Policy
              </button>
            </div>
          </div>

          {/* Data Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">💾 Data Management</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all text-left">
                📥 Export Data (CSV/JSON)
              </button>
              <button className="w-full px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all text-left">
                🗑️ Clear Cache
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4">💬 Support</h2>
            <div className="space-y-3">
              <Link
                href="#"
                className="block px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all"
              >
                ❓ Help & FAQs
              </Link>
              <Link
                href="#"
                className="block px-4 py-3 bg-[#1a0f2e] border border-[#3d2e5f] rounded-lg text-[#b0afc0] hover:text-white hover:border-purple-500/50 transition-all"
              >
                📧 Contact Support
              </Link>
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Logging out...' : '🚪 Log Out'}
            </button>
            <button className="flex-1 px-4 py-3 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-all font-medium">
              🗑️ Delete Account
            </button>
          </div>

          {/* App Version */}
          <div className="text-center pt-8 border-t border-[#3d2e5f]">
            <p className="text-sm text-[#b0afc0]">
              FundTrack v0.2.0 • © 2024-2025 FundTrack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
