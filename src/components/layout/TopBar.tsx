'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showBack, onBack }: TopBarProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="sticky top-0 z-10 bg-carbon-gray border-b border-slate-gray/30 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack || (() => router.back())}
              className="text-bright-white hover:text-neon-cyan"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-bright-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-bright-white hover:text-neon-cyan"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-bright-white hover:text-neon-cyan"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
