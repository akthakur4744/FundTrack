import type { Metadata } from 'next';
import '../globals.css';

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
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
