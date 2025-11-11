'use client';

import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

type AppShellProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function AppShell({ title, description, actions, children }: AppShellProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Navbar user={user} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="px-4 py-6 sm:px-6 lg:px-10">
          {(title || description || actions) && (
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {title && <h1 className="text-3xl font-semibold text-brand-900">{title}</h1>}
                {description && <p className="mt-1 text-sm text-brand-600">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </header>
          )}
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}


