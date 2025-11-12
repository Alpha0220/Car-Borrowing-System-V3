'use client';

import AppShell from '@/components/AppShell';
import { getMyBorrows, returnVehicle } from '@/lib/actions/borrow.action';
import { getVehicles } from '@/lib/actions/vehicle.action';
import type { Borrow, Vehicle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type BorrowFormState = Record<string, string>;

const statusMeta: Record<
  Borrow['status'],
  { label: string; badgeClass: string; description: string }
> = {
  PENDING: {
    label: 'รออนุมัติ',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    description: 'คำขอถูกส่งแล้ว กรุณารอผู้จัดการอนุมัติ',
  },
  APPROVED: {
    label: 'อนุมัติแล้ว',
    badgeClass: 'bg-brand-100 text-brand-800',
    description: 'สามารถนำรถออกใช้งานได้ตามคำขอนี้',
  },
  IN_USE: {
    label: 'กำลังใช้งาน',
    badgeClass: 'bg-blue-100 text-blue-800',
    description: 'กำลังใช้งานรถคันนี้อยู่ โปรดบันทึกเลขไมล์ตอนคืนรถ',
  },
  RETURNED: {
    label: 'คืนแล้ว',
    badgeClass: 'bg-green-100 text-green-800',
    description: 'คืนรถเรียบร้อยแล้ว ขอบคุณที่ดูแลรถของเรา',
  },
};

export default function MyBorrowsPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formState, setFormState] = useState<BorrowFormState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    setPageError(null);

    try {
      const [myBorrows, allVehicles] = await Promise.all([getMyBorrows(), getVehicles()]);
      setBorrows(myBorrows);
      setVehicles(allVehicles);

      const initialFormState: BorrowFormState = {};
      myBorrows.forEach((borrow: Borrow) => {
        const defaultValue =
          borrow.endMileage?.toString() ??
          (borrow.startMileage ? borrow.startMileage.toString() : '0');
        initialFormState[borrow.id] = defaultValue;
      });
      setFormState(initialFormState);
    } catch (error: any) {
      console.error('Failed to fetch borrow data:', error);
      setPageError('ไม่สามารถโหลดรายการเบิกรถได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (borrowId: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [borrowId]: value,
    }));
  };

  const handleReturn = async (borrowId: string) => {
    const mileageValue = formState[borrowId];
    if (!mileageValue || Number(mileageValue) <= 0) {
      alert('กรุณากรอกเลขไมล์คืนที่ถูกต้อง');
      return;
    }

    setSubmittingId(borrowId);
    try {
      await returnVehicle(borrowId, Number(mileageValue));
      await fetchData();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถบันทึกข้อมูลคืนรถได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmittingId(null);
    }
  };

  const vehicleMap = useMemo(
    () =>
      vehicles.reduce<Record<string, Vehicle>>((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {}),
    [vehicles]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
          กำลังโหลดรายการเบิกรถของคุณ...
        </div>
      );
    }

    if (pageError) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {pageError}
        </div>
      );
    }

    if (borrows.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
          ยังไม่มีคำขอเบิกรถในระบบ เริ่มต้นขอเบิกรถได้จากเมนู “ขอเบิกรถ”
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {borrows.map((borrow) => {
          const vehicle = vehicleMap[borrow.vehicleId];
          const status = statusMeta[borrow.status];

          return (
            <div
              key={borrow.id}
              className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    ทะเบียนรถ
                  </p>
                  <h3 className="text-2xl font-semibold text-brand-900">
                    {vehicle?.licensePlate ?? 'ไม่พบทะเบียน'}
                  </h3>
                  <p className="text-sm text-brand-600">
                    ขอเบิกเมื่อ {new Date(borrow.borrowDate).toLocaleString('th-TH')}
                  </p>
                  {borrow.returnDate && (
                    <p className="text-sm text-brand-600">
                      คืนรถเมื่อ {new Date(borrow.returnDate).toLocaleString('th-TH')}
                    </p>
                  )}
                </div>
                <div className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                  <span className={`inline-block rounded-full px-3 py-1 ${status.badgeClass}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    เลขไมล์เริ่มต้น
                  </p>
                  <p className="mt-1 text-lg font-semibold text-brand-900">
                    {borrow.startMileage ? borrow.startMileage.toLocaleString('th-TH') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    เลขไมล์คืนล่าสุด
                  </p>
                  <p className="mt-1 text-lg font-semibold text-brand-900">
                    {borrow.endMileage ? borrow.endMileage.toLocaleString('th-TH') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    น้ำมันที่ใช้ (ลิตร)
                  </p>
                  <p className="mt-1 text-lg font-semibold text-brand-900">
                    {borrow.fuelUsedLiters ? Number(borrow.fuelUsedLiters).toLocaleString('th-TH') : '-'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-brand-600">{status.description}</p>

              {(borrow.status === 'APPROVED' || borrow.status === 'IN_USE') && (
                <div className="mt-6 border-t border-brand-100 pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <label
                        htmlFor={`endMileage-${borrow.id}`}
                        className="block text-sm font-semibold text-brand-800"
                      >
                        บันทึกเลขไมล์ตอนคืนรถ
                      </label>
                      <input
                        id={`endMileage-${borrow.id}`}
                        type="number"
                        min={0}
                        value={formState[borrow.id] ?? ''}
                        onChange={(event) => handleFormChange(borrow.id, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReturn(borrow.id)}
                      disabled={submittingId === borrow.id}
                      className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-200 sm:w-auto"
                    >
                      {submittingId === borrow.id ? 'กำลังบันทึก...' : 'บันทึกการคืนรถ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AppShell
      title="รายการเบิกรถของฉัน"
      description="ติดตามสถานะและบันทึกข้อมูลการคืนรถได้จากที่นี่"
    >
      {renderContent()}
    </AppShell>
  );
}


