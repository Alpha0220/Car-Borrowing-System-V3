'use client';

import AppShell from '@/components/AppShell';
import { approveBorrow, getPendingBorrows } from '@/lib/actions/borrow.action';
import { getUsers } from '@/lib/actions/user.action';
import { getVehicleSummary } from '@/lib/actions/vehicle.action';
import type { Borrow, User, VehicleSummary } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type ApprovalFormState = {
  startMileage: string;
  fuelUsedLiters: string;
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [summaries, setSummaries] = useState<Record<string, VehicleSummary>>({});
  const [formState, setFormState] = useState<Record<string, ApprovalFormState>>({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

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

    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    setPageError(null);

    try {
      const [borrowsData, usersData] = await Promise.all([getPendingBorrows(), getUsers()]);
      setBorrows(borrowsData);
      setUsers(usersData);

      const vehicleIds = Array.from(new Set(borrowsData.map((borrow) => borrow.vehicleId)));
      const summaryEntries = await Promise.all(
        vehicleIds.map(async (vehicleId) => {
          const summary: VehicleSummary = await getVehicleSummary(vehicleId);
          return [vehicleId, summary] as const;
        })
      );

      const summaryMap = Object.fromEntries(summaryEntries);
      setSummaries(summaryMap);

      const initialFormState: Record<string, ApprovalFormState> = {};
      borrowsData.forEach((borrow) => {
        const summary = summaryMap[borrow.vehicleId];
        const defaultMileage = summary?.latestMileage ?? 0;
        initialFormState[borrow.id] = {
          startMileage: defaultMileage > 0 ? defaultMileage.toString() : '0',
          fuelUsedLiters: borrow.fuelUsedLiters ? borrow.fuelUsedLiters.toString() : '',
        };
      });
      setFormState(initialFormState);
    } catch (error) {
      console.error('Failed to fetch approval data:', error);
      setPageError('ไม่สามารถโหลดรายการอนุมัติได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (borrowId: string, field: keyof ApprovalFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [borrowId]: {
        ...prev[borrowId],
        [field]: value,
      },
    }));
  };

  const handleApprove = async (borrowId: string) => {
    const form = formState[borrowId];
    if (!form || form.startMileage === '' || Number(form.startMileage) < 0) {
      alert('กรุณาตรวจสอบเลขไมล์เริ่มต้นให้ถูกต้อง');
      return;
    }

    setSubmittingId(borrowId);
    try {
      await approveBorrow(borrowId, {
        startMileage: Number(form.startMileage),
        fuelUsedLiters: form.fuelUsedLiters ? Number(form.fuelUsedLiters) : undefined,
      });
      await fetchData();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถอนุมัติคำขอได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmittingId(null);
    }
  };

  const getUserName = (userId: string) => users.find((user) => user.id === userId)?.name ?? 'ไม่ทราบชื่อ';

  const getVehicleLabel = (borrow: Borrow) =>
    summaries[borrow.vehicleId]?.vehicle.licensePlate ?? 'ไม่พบทะเบียน';

  const emptyStateDescription = useMemo(() => {
    if (loading) {
      return 'กำลังเตรียมรายการคำขอที่รออนุมัติ...';
    }

    if (pageError) {
      return pageError;
    }

    return 'ตอนนี้ไม่มีคำขอเบิกรถที่รออนุมัติ';
  }, [loading, pageError]);

  const formatNumber = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return Number(value).toLocaleString('th-TH');
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('th-TH');
  };

  return (
    <AppShell
      title="อนุมัติคำขอเบิกรถ"
      description="ตรวจสอบรายละเอียดรถจากข้อมูลล่าสุดก่อนยืนยันการอนุมัติ เพื่อความถูกต้องและปลอดภัย"
    >
      {borrows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
          {emptyStateDescription}
        </div>
      ) : (
        <div className="space-y-6">
          {borrows.map((borrow) => {
            const summary = summaries[borrow.vehicleId];
            const form = formState[borrow.id];
            const borrowerName = getUserName(borrow.userId);

            return (
              <div
                key={borrow.id}
                className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                      คำขอจาก
                    </p>
                    <h3 className="text-2xl font-semibold text-brand-900">{borrowerName}</h3>
                    <p className="text-sm text-brand-600">
                      ส่งคำขอเมื่อ {formatDateTime(borrow.borrowDate)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-right">
                    <p className="text-xs text-brand-500">ทะเบียนรถ</p>
                    <p className="text-lg font-semibold text-brand-900">{getVehicleLabel(borrow)}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      ข้อมูลรถล่าสุด
                    </p>
                    <p className="text-sm text-brand-600">
                      สถานะปัจจุบัน:{' '}
                      <span className="font-semibold text-brand-800">
                        {summary?.vehicle.status === 'AVAILABLE'
                          ? 'พร้อมใช้งาน'
                          : summary?.vehicle.status === 'IN_USE'
                            ? 'กำลังใช้งาน'
                            : summary?.vehicle.status === 'BROKEN'
                              ? 'ชำรุด'
                              : 'ไม่ทราบ'}
                      </span>
                    </p>
                    <p className="text-sm text-brand-600">
                      Easy Pass:{' '}
                      <span className="font-semibold text-brand-800">
                        {formatNumber(summary?.vehicle.easypassBalance)} บาท
                      </span>
                    </p>
                    <p className="text-sm text-brand-600">
                      เลขไมล์ล่าสุด:{' '}
                      <span className="font-semibold text-brand-800">
                        {formatNumber(summary?.latestMileage)} กม.
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      ประวัติการใช้งานครั้งล่าสุด
                    </p>
                    <p className="text-sm text-brand-600">
                      เริ่มใช้งาน:{' '}
                      <span className="font-semibold text-brand-800">
                        {formatDateTime(summary?.latestBorrow?.borrowDate)}
                      </span>
                    </p>
                    <p className="text-sm text-brand-600">
                      คืนรถ:{' '}
                      <span className="font-semibold text-brand-800">
                        {formatDateTime(summary?.latestBorrow?.returnDate)}
                      </span>
                    </p>
                    <p className="text-sm text-brand-600">
                      ไมล์ตอนคืน:{' '}
                      <span className="font-semibold text-brand-800">
                        {formatNumber(summary?.latestBorrow?.endMileage)} กม.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-brand-100 pt-6">
                  <div className="grid gap-4 sm:grid-cols-[2fr,1fr]">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor={`startMileage-${borrow.id}`}
                          className="block text-sm font-semibold text-brand-800"
                        >
                          เลขไมล์เริ่มต้น
                        </label>
                        <input
                          id={`startMileage-${borrow.id}`}
                          type="number"
                          min={0}
                          value={form?.startMileage ?? ''}
                          onChange={(event) =>
                            handleFormChange(borrow.id, 'startMileage', event.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`fuelUsed-${borrow.id}`}
                          className="block text-sm font-semibold text-brand-800"
                        >
                          น้ำมันที่ใช้ (ลิตร)
                          <span className="ml-1 text-xs font-normal text-brand-500">(ไม่บังคับ)</span>
                        </label>
                        <input
                          id={`fuelUsed-${borrow.id}`}
                          type="number"
                          min={0}
                          step="0.1"
                          value={form?.fuelUsedLiters ?? ''}
                          onChange={(event) =>
                            handleFormChange(borrow.id, 'fuelUsedLiters', event.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(borrow.id)}
                        disabled={submittingId === borrow.id}
                        className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-200"
                      >
                        {submittingId === borrow.id ? 'กำลังอนุมัติ...' : 'ยืนยันอนุมัติรถคันนี้'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}


