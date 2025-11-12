'use client';

import AppShell from '@/components/AppShell';
import { createBorrow } from '@/lib/actions/borrow.action';
import { getVehicles } from '@/lib/actions/vehicle.action';
import type { Vehicle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function BorrowPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [licensePlate, setLicensePlate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    getVehicles()
      .then((data) => setVehicles(data))
      .catch((err) => {
        console.error('Failed to fetch vehicles:', err);
        setError('ไม่สามารถดึงรายการรถได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE'),
    [vehicles]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createBorrow(licensePlate);
      setSuccessMessage('ส่งคำขอสำเร็จ กำลังพาไปยังหน้ารายการของฉัน...');
      setTimeout(() => {
        router.push('/my-borrows');
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="ขอเบิกรถ"
      description="เลือกทะเบียนรถที่ต้องการใช้งาน และส่งคำขอเพื่อรอการอนุมัติจากผู้จัดการ"
    >
      <div className="mx-auto max-w-3xl">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-white/70 p-10 text-center text-brand-500">
            กำลังโหลดข้อมูลรถที่พร้อมใช้งาน...
          </div>
        ) : (
          <div className="space-y-4">
            {successMessage && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-sm backdrop-blur"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="licensePlate" className="block text-sm font-semibold text-brand-800">
                    ทะเบียนรถที่ต้องการเบิก
                  </label>
                  <input
                    id="licensePlate"
                    type="text"
                    required
                    autoComplete="off"
                    value={licensePlate}
                    onChange={(event) => setLicensePlate(event.target.value.toUpperCase())}
                    placeholder="เช่น กข 1234"
                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                  <p className="text-xs text-brand-500">กรอกทะเบียนรถ 1 คัน หรือเลือกจากรายการด้านล่าง</p>
                </div>

                {availableVehicles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-brand-800">รถที่พร้อมใช้งานตอนนี้</p>
                    <div className="flex flex-wrap gap-2">
                      {availableVehicles.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() => setLicensePlate(vehicle.licensePlate)}
                          className={[
                            'rounded-full border px-4 py-2 text-sm font-medium transition',
                            licensePlate === vehicle.licensePlate
                              ? 'border-brand-500 bg-brand-100 text-brand-800'
                              : 'border-brand-100 bg-white text-brand-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800',
                          ].join(' ')}
                        >
                          {vehicle.licensePlate}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !licensePlate}
                  className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-200"
                >
                  {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิกรถ'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}


