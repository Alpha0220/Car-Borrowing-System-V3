'use client';

import AppShell from '@/components/AppShell';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type DashboardAction = {
  key: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  roles?: Array<User['role']>;
};

const actions: DashboardAction[] = [
  {
    key: 'borrow',
    label: 'ขอเบิกรถ',
    description: 'สร้างคำขอเบิกรถใหม่ได้อย่างรวดเร็ว',
    icon: '🚗',
    href: '/borrow',
    roles: ['EMPLOYEE', 'MANAGER', 'SUPER_ADMIN'],
  },
  {
    key: 'my-borrows',
    label: 'รายการของฉัน',
    description: 'ติดตามสถานะเบิกรถและคืนรถทั้งหมด',
    icon: '🗂',
    href: '/my-borrows',
    roles: ['EMPLOYEE', 'MANAGER', 'SUPER_ADMIN'],
  },
  {
    key: 'approvals',
    label: 'อนุมัติคำขอ',
    description: 'ตรวจสอบและยืนยันคำขอเบิกรถล่าสุด',
    icon: '✅',
    href: '/approvals',
    roles: ['MANAGER', 'SUPER_ADMIN'],
  },
  {
    key: 'reports',
    label: 'รายงานการใช้งาน',
    description: 'ดูสถิติและประวัติการเบิกรถแบบละเอียด',
    icon: '📈',
    href: '/reports',
    roles: ['MANAGER', 'SUPER_ADMIN'],
  },
  {
    key: 'vehicles',
    label: 'สถานะรถทั้งหมด',
    description: 'ตรวจสอบสถานะรถและยอดเงิน Easy Pass ปัจจุบัน',
    icon: '🚙',
    href: '/vehicles',
  },
  {
    key: 'users',
    label: 'จัดการผู้ใช้',
    description: 'เพิ่มและบริหารสิทธิ์การใช้งานของแต่ละคน',
    icon: '👥',
    href: '/users',
    roles: ['SUPER_ADMIN'],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setIsLoading(false);
  }, [router]);

  const availableActions = useMemo(() => {
    if (!user) {
      return actions.filter((action) => !action.roles || action.roles.includes('EMPLOYEE'));
    }

    return actions.filter((action) => !action.roles || action.roles.includes(user.role));
  }, [user]);

  if (isLoading) {
    return (
      <AppShell title="แดชบอร์ด" description="ภาพรวมการใช้งานระบบ Creatus Car Service">
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-10 text-center text-brand-500">
          กำลังโหลดข้อมูลบัญชีผู้ใช้...
        </div>
      </AppShell>
    );
  }

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <AppShell title="แดชบอร์ด" description="เลือกเมนูการทำงานที่ต้องการจากรายการด้านล่าง">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {availableActions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => handleNavigate(action.href)}
            className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-brand-100 bg-white/90 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
          >
            <span className="text-3xl">{action.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-brand-900">{action.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-600">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}

