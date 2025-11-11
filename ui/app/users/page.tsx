'use client';

import AppShell from '@/components/AppShell';
import { createUser, getUsers } from '@/lib/actions/user.action';
import type { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserFormState = {
  name: string;
  employeeId: string;
  role: UserRole;
};

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'ผู้ดูแลระบบ',
  MANAGER: 'ผู้จัดการ',
  EMPLOYEE: 'พนักงาน',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<UserFormState>({
    name: '',
    employeeId: '',
    role: 'EMPLOYEE',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed: User = JSON.parse(userStr);
      if (parsed.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
    }

    getUsers()
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error('Failed to fetch users:', error);
        setPageError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setPageError(null);

    try {
      await createUser(formState);
      setFormState({ name: '', employeeId: '', role: 'EMPLOYEE' });
      setShowForm(false);
      const refreshedUsers = await getUsers();
      setUsers(refreshedUsers);
    } catch (error: any) {
      setPageError(error.response?.data?.error || 'ไม่สามารถเพิ่มผู้ใช้ใหม่ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="จัดการผู้ใช้"
      description="เพิ่ม แก้ไข และตรวจสอบรายชื่อผู้ใช้ที่มีสิทธิ์เข้าใช้งานระบบ"
      actions={
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-xl border border-brand-400 bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
        >
          {showForm ? 'ปิดฟอร์มเพิ่มผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
        </button>
      }
    >
      {loading ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
          กำลังโหลดข้อมูลผู้ใช้...
        </div>
      ) : (
        <div className="space-y-6">
          {pageError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pageError}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-sm backdrop-blur"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-brand-800">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-semibold text-brand-800">
                    รหัสพนักงาน
                  </label>
                  <input
                    id="employeeId"
                    type="text"
                    required
                    value={formState.employeeId}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, employeeId: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-brand-800">
                    บทบาทในระบบ
                  </label>
                  <select
                    id="role"
                    value={formState.role}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, role: event.target.value as UserRole }))
                    }
                    className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    <option value="EMPLOYEE">พนักงาน</option>
                    <option value="MANAGER">ผู้จัดการ</option>
                    <option value="SUPER_ADMIN">ผู้ดูแลระบบ</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-200"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้ใหม่'}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-brand-100 text-sm">
              <thead className="bg-brand-50/70">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">ชื่อ</th>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">รหัสพนักงาน</th>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">บทบาท</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-50/40">
                    <td className="px-6 py-4 text-brand-900">{user.name}</td>
                    <td className="px-6 py-4 text-brand-700">{user.employeeId}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                        {roleLabels[user.role]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}


