'use client';

import AppShell from '@/components/AppShell';
import { createVehicle, getVehicles } from '@/lib/actions/vehicle.action';
import type { User, Vehicle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type VehicleFormState = {
  licensePlate: string;
  easypassBalance: string;
};

const vehicleStatusMeta: Record<
  Vehicle['status'],
  { label: string; badgeClass: string; description: string }
> = {
  AVAILABLE: {
    label: 'พร้อมใช้งาน',
    badgeClass: 'bg-green-100 text-green-800',
    description: 'รถคันนี้พร้อมให้เบิกใช้งานได้ทันที',
  },
  IN_USE: {
    label: 'กำลังใช้งาน',
    badgeClass: 'bg-blue-100 text-blue-800',
    description: 'กำลังมีการใช้งานอยู่ โปรดตรวจสอบสถานะการคืน',
  },
  BROKEN: {
    label: 'ชำรุด',
    badgeClass: 'bg-red-100 text-red-800',
    description: 'อยู่ระหว่างการซ่อมบำรุงหรือไม่พร้อมใช้งาน',
  },
};

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<VehicleFormState>({
    licensePlate: '',
    easypassBalance: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    getVehicles()
      .then((data) => setVehicles(data))
      .catch((err) => {
        console.error('Failed to fetch vehicles:', err);
        setError('ไม่สามารถโหลดรายการรถได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const isManager = useMemo(
    () => user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN',
    [user]
  );

  const availableCount = vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createVehicle({
        licensePlate: formState.licensePlate,
        easypassBalance: formState.easypassBalance ? Number(formState.easypassBalance) : undefined,
      });
      setFormState({ licensePlate: '', easypassBalance: '' });
      setShowForm(false);
      const refreshedVehicles = await getVehicles();
      setVehicles(refreshedVehicles);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถเพิ่มรถใหม่ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value?: string | null) =>
    Number(value ?? 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <AppShell
      title="สถานะรถทั้งหมด"
      description="ตรวจสอบสถานะและยอดเงิน Easy Pass ของรถทุกคันภายในองค์กร"
      actions={
        isManager && (
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="rounded-xl border border-brand-400 bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
          >
            {showForm ? 'ปิดฟอร์มเพิ่มรถ' : 'เพิ่มรถคันใหม่'}
          </button>
        )
      }
    >
      {loading ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
          กำลังโหลดข้อมูลรถ...
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {showForm && isManager && (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-sm backdrop-blur"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="licensePlate" className="block text-sm font-semibold text-brand-800">
                    ทะเบียนรถ *
                  </label>
                  <input
                    id="licensePlate"
                    type="text"
                    required
                    value={formState.licensePlate}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        licensePlate: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="เช่น กข 1234"
                    className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="easypassBalance"
                    className="block text-sm font-semibold text-brand-800"
                  >
                    ยอดเงิน Easy Pass (ไม่บังคับ)
                  </label>
                  <input
                    id="easypassBalance"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formState.easypassBalance}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        easypassBalance: event.target.value,
                      }))
                    }
                    placeholder="ระบุจำนวนเงินปัจจุบัน"
                    className="mt-2 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-200"
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรถคันใหม่'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid gap-4 rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-sm sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                รถทั้งหมด
              </p>
              <p className="text-3xl font-semibold text-brand-900">{vehicles.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                พร้อมใช้งาน
              </p>
              <p className="text-3xl font-semibold text-brand-900">{availableCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                อัปเดตล่าสุด
              </p>
              <p className="text-base text-brand-600">
                {vehicles.length > 0
                  ? new Date(vehicles[0].updatedAt).toLocaleString('th-TH')
                  : '-'}
              </p>
            </div>
          </div>

          {vehicles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-white/80 p-12 text-center text-brand-500">
              ยังไม่มีรายการรถในระบบ
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => {
                const meta = vehicleStatusMeta[vehicle.status];
                return (
                  <div
                    key={vehicle.id}
                    className="flex h-full flex-col rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                          ทะเบียนรถ
                        </p>
                        <h3 className="text-2xl font-semibold text-brand-900">{vehicle.licensePlate}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-brand-600">
                      <p>
                        <span className="font-semibold text-brand-800">เงิน Easy Pass:</span>{' '}
                        {formatCurrency(vehicle.easypassBalance)} บาท
                      </p>
                      <p>
                        <span className="font-semibold text-brand-800">อัปเดตล่าสุด:</span>{' '}
                        {new Date(vehicle.updatedAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <p className="mt-4 text-sm text-brand-500">{meta.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}


