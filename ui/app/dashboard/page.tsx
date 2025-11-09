'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, UserRole } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const isEmployee = user.role === 'EMPLOYEE';
  const isManager = user.role === 'MANAGER' || user.role === 'SUPER_ADMIN';
  const isAdmin = user.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">แดชบอร์ด</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isEmployee && (
            <>
              <div
                onClick={() => router.push('/borrow')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">🚗 ขอเบิกรถ</h3>
                <p className="text-gray-600">สร้างคำขอเบิกรถใหม่</p>
              </div>
              <div
                onClick={() => router.push('/my-borrows')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">📋 รายการเบิกรถของฉัน</h3>
                <p className="text-gray-600">ดูรายการเบิกรถทั้งหมด</p>
              </div>
            </>
          )}

          {isManager && (
            <>
              <div
                onClick={() => router.push('/approvals')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">✅ อนุมัติคำขอ</h3>
                <p className="text-gray-600">ตรวจสอบและอนุมัติคำขอเบิกรถ</p>
              </div>
              <div
                onClick={() => router.push('/reports')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">📊 รายงาน</h3>
                <p className="text-gray-600">ดูรายงานการเบิกรถ</p>
              </div>
            </>
          )}

          <div
            onClick={() => router.push('/vehicles')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">🚙 สถานะรถ</h3>
            <p className="text-gray-600">ดูสถานะรถและเงิน Easy Pass</p>
          </div>

          {isAdmin && (
            <div
              onClick={() => router.push('/users')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">👥 จัดการผู้ใช้</h3>
              <p className="text-gray-600">เพิ่มและจัดการผู้ใช้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

