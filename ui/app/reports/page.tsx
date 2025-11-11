'use client';

import AppShell from '@/components/AppShell';
import { getReports } from '@/lib/actions/borrow.action';
import { getUsers } from '@/lib/actions/user.action';
import { getVehicles } from '@/lib/actions/vehicle.action';
import type { Borrow, User, Vehicle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type ReportFilters = {
  status: string;
  borrowDateFrom: string;
  borrowDateTo: string;
};

const statusMeta: Record<
  Borrow['status'],
  { label: string; badgeClass: string }
> = {
  PENDING: { label: 'รออนุมัติ', badgeClass: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'อนุมัติแล้ว', badgeClass: 'bg-blue-100 text-blue-800' },
  IN_USE: { label: 'กำลังใช้งาน', badgeClass: 'bg-brand-100 text-brand-800' },
  RETURNED: { label: 'คืนแล้ว', badgeClass: 'bg-green-100 text-green-800' },
};

export default function ReportsPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    status: '',
    borrowDateFrom: '',
    borrowDateTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser: User = JSON.parse(userStr);
      if (parsedUser.role === 'EMPLOYEE') {
        router.push('/dashboard');
        return;
      }
    }

    Promise.all([getReports(filters), getUsers(), getVehicles()])
      .then(([reportData, userData, vehicleData]) => {
        setBorrows(reportData);
        setUsers(userData);
        setVehicles(vehicleData);
        setInitialized(true);
      })
      .catch((error) => {
        console.error('Failed to load reports:', error);
        setPageError('ไม่สามารถโหลดรายงานได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!initialized) return;

    setLoading(true);
    setPageError(null);
    getReports(filters)
      .then((reportData) => {
        setBorrows(reportData);
      })
      .catch((error) => {
        console.error('Failed to filter reports:', error);
        setPageError('ไม่สามารถกรองข้อมูลรายงานได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setLoading(false));
  }, [filters, initialized]);

  const userMap = useMemo(
    () =>
      users.reduce<Record<string, User>>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {}),
    [users]
  );

  const vehicleMap = useMemo(
    () =>
      vehicles.reduce<Record<string, Vehicle>>((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {}),
    [vehicles]
  );

  const totalDistance = useMemo(() => {
    return borrows.reduce((sum, borrow) => {
      if (borrow.startMileage && borrow.endMileage) {
        return sum + (borrow.endMileage - borrow.startMileage);
      }
      return sum;
    }, 0);
  }, [borrows]);

  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AppShell
      title="รายงานการเบิกรถ"
      description="ตรวจสอบประวัติการเบิกรถทั้งหมด พร้อมกรองข้อมูลตามสถานะและช่วงเวลา"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-900">ตัวกรองข้อมูล</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-brand-800">
                สถานะคำขอ
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(event) => handleFilterChange('status', event.target.value)}
                className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="">ทั้งหมด</option>
                <option value="PENDING">รออนุมัติ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="IN_USE">กำลังใช้งาน</option>
                <option value="RETURNED">คืนแล้ว</option>
              </select>
            </div>
            <div>
              <label htmlFor="borrowDateFrom" className="block text-sm font-semibold text-brand-800">
                วันที่เบิก (จาก)
              </label>
              <input
                id="borrowDateFrom"
                type="date"
                value={filters.borrowDateFrom}
                onChange={(event) => handleFilterChange('borrowDateFrom', event.target.value)}
                className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div>
              <label htmlFor="borrowDateTo" className="block text-sm font-semibold text-brand-800">
                วันที่เบิก (ถึง)
              </label>
              <input
                id="borrowDateTo"
                type="date"
                value={filters.borrowDateTo}
                onChange={(event) => handleFilterChange('borrowDateTo', event.target.value)}
                className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              รายการทั้งหมด
            </p>
            <p className="mt-1 text-3xl font-semibold text-brand-900">{borrows.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              ระยะทางที่บันทึกได้
            </p>
            <p className="mt-1 text-3xl font-semibold text-brand-900">
              {totalDistance.toLocaleString('th-TH')} กม.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              อัปเดตล่าสุด
            </p>
            <p className="mt-1 text-base text-brand-600">
              {borrows.length > 0
                ? new Date(borrows[0].updatedAt).toLocaleString('th-TH')
                : '-'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
            กำลังโหลดข้อมูลรายงาน...
          </div>
        ) : pageError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {pageError}
          </div>
        ) : borrows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
            ไม่พบข้อมูลตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-brand-100 text-sm">
              <thead className="bg-brand-50/70">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">พนักงาน</th>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">ทะเบียนรถ</th>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">วันที่เบิก</th>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">วันที่คืน</th>
                  <th className="px-6 py-3 text-left font-semibold text-brand-700">เลขไมล์</th>
                  <th className="px-6 py-3 text-right font-semibold text-brand-700">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {borrows.map((borrow) => {
                  const user = userMap[borrow.userId];
                  const vehicle = vehicleMap[borrow.vehicleId];
                  const meta = statusMeta[borrow.status];

                  return (
                    <tr key={borrow.id} className="hover:bg-brand-50/40">
                      <td className="px-6 py-4 text-brand-900">
                        <div className="font-semibold">{user?.name ?? 'ไม่ทราบชื่อ'}</div>
                        <div className="text-xs text-brand-500">{user?.employeeId ?? '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-brand-900">{vehicle?.licensePlate ?? '-'}</td>
                      <td className="px-6 py-4 text-brand-700">
                        {new Date(borrow.borrowDate).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-brand-700">
                        {borrow.returnDate ? new Date(borrow.returnDate).toLocaleString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 text-brand-700">
                        <div>
                          <span className="text-xs text-brand-500">เริ่ม</span>{' '}
                          <span className="font-medium">{borrow.startMileage ?? '-'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-brand-500">คืน</span>{' '}
                          <span className="font-medium">{borrow.endMileage ?? '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}


