import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Only ADMIN role can access admin dashboard
  const role = (session.user as any).role;
  if (role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}
