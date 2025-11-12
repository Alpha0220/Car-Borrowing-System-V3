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
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 text-brand-700 transition hover:border-brand-200 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 lg:hidden"
            aria-label="Toggle navigation"
          >
            <span className="text-xl">☰</span>
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-500">Creatus Mobility</p>
            <p className="text-lg font-semibold text-brand-900">Car Service Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-brand-900">{userDisplay.name}</p>
            {userDisplay.role && <p className="text-xs text-brand-500">{userDisplay.role}</p>}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  );
}


