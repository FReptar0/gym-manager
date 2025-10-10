'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/payments', label: 'Pagos', icon: DollarSign },
  { href: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-carbon-gray border-t border-slate-gray/30 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-neon-cyan'
                  : 'text-light-gray hover:text-bright-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
