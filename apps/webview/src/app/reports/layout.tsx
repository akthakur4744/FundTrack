// Mark this layout as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
