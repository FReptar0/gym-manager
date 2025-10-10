'use client';

import { BottomNav } from '@/components/layout/BottomNav';
import { useRequireAuth } from '@/hooks';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-neon-cyan" />
          <p className="text-light-gray mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useRequireAuth will handle redirect
  }

  return (
    <div className="min-h-screen bg-deep-black pb-16 md:pb-0">
      {children}
      <BottomNav />
    </div>
  );
}
