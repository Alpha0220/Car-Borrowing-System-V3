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
    <div className="flex h-full flex-col gap-6 bg-white px-4 py-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
        <p className="text-sm font-semibold text-brand-900">Creatus Car Service</p>
        <p className="text-xs text-brand-500">{badgeLabel}</p>
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
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-100 text-brand-900 shadow-sm'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-800',
              ].join(' ')}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-dashed border-brand-200 p-4 text-xs text-brand-500">
        ระบบจะบันทึกข้อมูลการเบิกรถและการคืนรถทุกครั้ง เพื่อให้การอนุมัติและตรวจสอบง่ายขึ้น
      </div>
    </div>
  );

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-brand-100 bg-white shadow-xl transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {navContent}
      </aside>
    </>
  );
}


