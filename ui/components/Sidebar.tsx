'use client';

import type { User, UserRole } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type SidebarProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
};

const navItems: NavItem[] = [
  { label: 'แดชบอร์ด', href: '/dashboard', icon: '📊' },
  { label: 'ขอเบิกรถ', href: '/borrow', icon: '🚗', roles: ['EMPLOYEE', 'MANAGER', 'SUPER_ADMIN'] },
  { label: 'รายการของฉัน', href: '/my-borrows', icon: '🗂', roles: ['EMPLOYEE', 'MANAGER', 'SUPER_ADMIN'] },
  { label: 'อนุมัติคำขอ', href: '/approvals', icon: '✅', roles: ['MANAGER', 'SUPER_ADMIN'] },
  { label: 'รายงาน', href: '/reports', icon: '📈', roles: ['MANAGER', 'SUPER_ADMIN'] },
  { label: 'สถานะรถ', href: '/vehicles', icon: '🚙' },
  { label: 'จัดการผู้ใช้', href: '/users', icon: '👥', roles: ['SUPER_ADMIN'] },
];

const brandBadgeByRole: Partial<Record<UserRole, string>> = {
  SUPER_ADMIN: 'นนท. ผู้ดูแลระบบ',
  MANAGER: 'ฝ่ายจัดการ',
  EMPLOYEE: 'พนักงาน',
};

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const role = user?.role;

  const items = useMemo(() => {
    if (!role) {
      return navItems.filter((item) => !item.roles || item.roles.includes('EMPLOYEE'));
    }

    return navItems.filter((item) => !item.roles || item.roles.includes(role));
  }, [role]);

  const badgeLabel = role ? brandBadgeByRole[role] : 'กำลังตรวจสอบสิทธิ์...';

  const navContent = (
    <div className="flex h-full flex-col gap-6 bg-slate-50/95 px-4 py-6 backdrop-blur">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-md">
        <p className="text-sm font-semibold text-slate-900">Creatus Car Service</p>
        <p className="text-xs text-slate-500">{badgeLabel}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-white text-brand-700 shadow-inner ring-1 ring-brand-100'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
              ].join(' ')}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-3xl border border-dashed border-white/60 bg-white/60 p-4 text-xs text-slate-500 shadow-inner">
        ระบบจะบันทึกข้อมูลการเบิกรถและการคืนรถทุกครั้ง เพื่อให้การอนุมัติและตรวจสอบง่ายขึ้น
      </div>
    </div>
  );

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/20 bg-slate-100/80 shadow-xl backdrop-blur-xl transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {navContent}
      </aside>
    </>
  );
}


