'use client';

import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type NavbarProps = {
  user: User | null;
  onToggleSidebar?: () => void;
};

const roleLabels: Record<User['role'], string> = {
  SUPER_ADMIN: 'ผู้ดูแลระบบ',
  MANAGER: 'ผู้จัดการ',
  EMPLOYEE: 'พนักงาน',
};

export default function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const router = useRouter();

  const userDisplay = useMemo(() => {
    if (!user) {
      return {
        name: 'กำลังโหลดบัญชี...',
        role: '',
      };
    }

    return {
      name: user.name,
      role: roleLabels[user.role],
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-700/40 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600 lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-white/70">Creatus Mobility</p>
            <p className="text-lg font-semibold leading-tight">Car Service Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{userDisplay.name}</p>
            {userDisplay.role && <p className="text-xs text-white/80">{userDisplay.role}</p>}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-md transition hover:-translate-y-[1px] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            <span>ออกจากระบบ</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M20 18V6" />
              <path d="M13 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}


