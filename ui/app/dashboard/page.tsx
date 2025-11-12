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
        <div className="rounded-3xl border border-dashed border-brand-100 bg-white/70 p-10 text-center text-slate-500 shadow-inner">
          กำลังโหลดข้อมูลบัญชีผู้ใช้...
        </div>
      </AppShell>
    );
  }

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const quickActions = availableActions.slice(0, 5);

  return (
    <AppShell title="แดชบอร์ด" description="เลือกเมนูการทำงานที่ต้องการจากรายการด้านล่าง">
      <div className="mx-auto max-w-5xl space-y-8">
        {quickActions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-white/80 px-5 py-3 shadow-lg shadow-brand-500/5 backdrop-blur-md ring-1 ring-brand-100">
            {quickActions.map((action) => (
              <button
                key={`quick-${action.key}`}
                type="button"
                onClick={() => handleNavigate(action.href)}
                className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:-translate-y-[1px] hover:bg-brand-50/70 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
              >
                <span className="text-lg transition-transform duration-200 group-hover:scale-110">{action.icon}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {availableActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => handleNavigate(action.href)}
              className="group relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-3xl border border-transparent bg-white/80 p-6 text-left shadow-lg shadow-brand-500/5 backdrop-blur transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600 shadow-inner shadow-white">
                {action.icon}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{action.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{action.description}</p>
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 w-1/3 translate-x-10 bg-gradient-to-l from-brand-100/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

