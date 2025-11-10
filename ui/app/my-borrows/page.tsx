'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getMyBorrows } from '@/lib/actions/borrow.action';
import { getVehicles } from '@/lib/actions/vehicle.action';
import { returnVehicle } from '@/lib/actions/borrow.action';
import { Borrow, Vehicle } from '@/lib/types';

export default function MyBorrowsPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [endMileage, setEndMileage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [borrowsData, vehiclesData] = await Promise.all([
        getMyBorrows(),
        getVehicles(),
      ]);
      setBorrows(borrowsData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId: string) => {
    if (!endMileage || parseInt(endMileage) <= 0) {
      alert('กรุณากรอกเลขไมล์ที่ถูกต้อง');
      return;
    }

    setReturningId(borrowId);
    try {
      await returnVehicle(borrowId, parseInt(endMileage));
      setEndMileage('');
      setReturningId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to return vehicle');
    } finally {
      setReturningId(null);
    }
  };

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.licensePlate || 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'RETURNED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'รออนุมัติ';
      case 'APPROVED':
        return 'อนุมัติแล้ว';
      case 'IN_USE':
        return 'กำลังใช้งาน';
      case 'RETURNED':
        return 'คืนแล้ว';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">รายการเบิกรถของฉัน</h2>

        {borrows.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            ยังไม่มีรายการเบิกรถ
          </div>
        ) : (
          <div className="space-y-4">
            {borrows.map((borrow) => (
              <div key={borrow.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">ทะเบียน: {getVehiclePlate(borrow.vehicleId)}</h3>
                    <p className="text-sm text-gray-600">
                      วันที่เบิก: {new Date(borrow.borrowDate).toLocaleString('th-TH')}
                    </p>
                    {borrow.returnDate && (
                      <p className="text-sm text-gray-600">
                        วันที่คืน: {new Date(borrow.returnDate).toLocaleString('th-TH')}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(borrow.status)}`}>
                    {getStatusText(borrow.status)}
                  </span>
                </div>

                {borrow.startMileage && (
                  <p className="text-sm text-gray-600 mb-2">เลขไมล์เริ่มต้น: {borrow.startMileage.toLocaleString()}</p>
                )}
                {borrow.endMileage && (
                  <p className="text-sm text-gray-600 mb-2">เลขไมล์คืน: {borrow.endMileage.toLocaleString()}</p>
                )}

                {(borrow.status === 'APPROVED' || borrow.status === 'IN_USE') && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="เลขไมล์คืน"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        value={returningId === borrow.id ? endMileage : ''}
                        onChange={(e) => {
                          setEndMileage(e.target.value);
                          setReturningId(borrow.id);
                        }}
                      />
                      <button
                        onClick={() => handleReturn(borrow.id)}
                        disabled={returningId === borrow.id && !endMileage}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        คืนรถ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

