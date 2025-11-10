'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getVehicles } from '@/lib/actions/vehicle.action';
import { createBorrow } from '@/lib/actions/borrow.action';
import { Vehicle } from '@/lib/types';

export default function BorrowPage() {
  const router = useRouter();
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchVehicles();
  }, [router]);

  const fetchVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await createBorrow(licensePlate);
      setSuccess(true);
      setLicensePlate('');
      setTimeout(() => {
        router.push('/my-borrows');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create borrow request');
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">ขอเบิกรถ</h2>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            สร้างคำขอเบิกรถสำเร็จ กำลังเปลี่ยนหน้า...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
                ทะเบียนรถ
              </label>
              <input
                id="licensePlate"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="เช่น กข 1234"
              />
            </div>

            {availableVehicles.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">รถที่พร้อมใช้งาน:</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setLicensePlate(vehicle.licensePlate)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    >
                      {vehicle.licensePlate}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิกรถ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

