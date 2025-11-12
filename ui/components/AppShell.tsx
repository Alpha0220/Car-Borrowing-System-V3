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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Navbar user={user} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
            {(title || description || actions) && (
              <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-surface/70 p-6 shadow-md ring-1 ring-muted/40 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title && <h1 className="text-3xl font-semibold text-foreground">{title}</h1>}
                  {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </header>
            )}
            <div className="flex-1 space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}


