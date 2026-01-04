import type { Metadata } from 'next';
import '../globals.css';
import { Providers } from './providers';

// Mark app as dynamic to prevent static generation issues with Firebase
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FundTrack - Expense Tracking',
  description: 'Track your expenses, manage budgets, and gain financial insights',
  viewport: {
    width: 'device-width',
    initialScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
