import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/Navigation';

// Mark app as dynamic to prevent static generation issues with Firebase
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'FundTrack - Expense Tracking',
  description: 'Track your expenses, manage budgets, and gain financial insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f0a1a]">
        <Providers>
          <Navigation />
          <main className="pb-24 md:pb-0 md:ml-64">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
