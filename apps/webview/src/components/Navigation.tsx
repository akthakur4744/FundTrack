'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@fundtrack/firebase';
import { logOut } from '@fundtrack/firebase';
import { useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Navigation items
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/expenses', label: 'Expenses', icon: '💰' },
    { href: '/budgets', label: 'Budgets', icon: '💳' },
    { href: '/categories', label: 'Categories', icon: '📁' },
    { href: '/reports', label: 'Reports', icon: '📈' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    try {
      await logOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1a1420] to-[#0f0a1a] border-r border-purple-500/20 p-6 z-50">
        {/* Logo/Branding */}
        <Link href="/" className="mb-8 flex items-center gap-3 group">
          <div className="text-3xl">💸</div>
          <div>
            <h1 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors">
              FundTrack
            </h1>
            <p className="text-xs text-[#b0afc0]">Expense Tracking</p>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-purple-500/20 to-transparent mb-6"></div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-600/50'
                  : 'text-[#b0afc0] hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-purple-500/20 to-transparent mb-6"></div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-[#b0afc0] hover:text-white group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d4af37] flex items-center justify-center text-white font-bold">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
              <p className="text-xs text-[#b0afc0]">{user?.email || 'Not signed in'}</p>
            </div>
            <span className={`text-lg transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
              ⋮
            </span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1420] border border-purple-500/30 rounded-lg overflow-hidden shadow-lg">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-3 text-[#b0afc0] hover:bg-white/5 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                ⚙️ Settings
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 text-[#b0afc0] hover:bg-white/5 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors border-t border-purple-500/20"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0a1a] to-[#1a1420] border-t border-purple-500/20 px-2 py-3 z-50">
        <div className="flex justify-around items-center">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'text-[#d4af37]'
                  : 'text-[#b0afc0] hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
          {/* Mobile User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                showUserMenu
                  ? 'text-[#d4af37]'
                  : 'text-[#b0afc0] hover:text-white'
              }`}
            >
              <span className="text-2xl">👤</span>
              <span className="text-xs font-medium">Menu</span>
            </button>

            {/* Mobile User Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1420] border border-purple-500/30 rounded-lg overflow-hidden shadow-lg">
                <div className="px-4 py-3 border-b border-purple-500/20">
                  <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-[#b0afc0] truncate">{user?.email || 'Not signed in'}</p>
                </div>
                <Link
                  href="/settings"
                  className="block px-4 py-3 text-[#b0afc0] hover:bg-white/5 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  ⚙️ Settings
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-[#b0afc0] hover:bg-white/5 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  👤 Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors border-t border-purple-500/20"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
