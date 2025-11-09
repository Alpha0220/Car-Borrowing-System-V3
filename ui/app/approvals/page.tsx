'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Borrow, Vehicle, User } from '@/lib/types';

export default function ApprovalsPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [startMileage, setStartMileage] = useState('');
  const [fuelUsedLiters, setFuelUsedLiters] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'EMPLOYEE') {
        router.push('/dashboard');
        return;
      }
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [borrowsRes, vehiclesRes, usersRes] = await Promise.all([
        api.get('/borrows/pending'),
        api.get('/vehicles'),
        api.get('/users'),
      ]);
      setBorrows(borrowsRes.data);
      setVehicles(vehiclesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (borrowId: string) => {
    if (!startMileage || parseInt(startMileage) <= 0) {
      alert('กรุณากรอกเลขไมล์เริ่มต้นที่ถูกต้อง');
      return;
    }

    setApprovingId(borrowId);
    try {
      await api.patch(`/borrows/${borrowId}/approve`, {
        startMileage: parseInt(startMileage),
        fuelUsedLiters: fuelUsedLiters ? parseFloat(fuelUsedLiters) : undefined,
      });
      setStartMileage('');
      setFuelUsedLiters('');
      setApprovingId(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve borrow');
    } finally {
      setApprovingId(null);
    }
  };

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.licensePlate || 'N/A';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'N/A';
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
        <h2 className="text-3xl font-bold mb-6">อนุมัติคำขอเบิกรถ</h2>

        {borrows.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            ไม่มีคำขอที่รออนุมัติ
          </div>
        ) : (
          <div className="space-y-4">
            {borrows.map((borrow) => (
              <div key={borrow.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">คำขอจาก: {getUserName(borrow.userId)}</h3>
                  <p className="text-gray-600">ทะเบียนรถ: {getVehiclePlate(borrow.vehicleId)}</p>
                  <p className="text-sm text-gray-600">
                    วันที่ขอ: {new Date(borrow.borrowDate).toLocaleString('th-TH')}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        เลขไมล์เริ่มต้น *
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={approvingId === borrow.id ? startMileage : ''}
                        onChange={(e) => {
                          setStartMileage(e.target.value);
                          setApprovingId(borrow.id);
                        }}
                        placeholder="เช่น 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        น้ำมันที่ใช้ (ลิตร) (ไม่บังคับ)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={approvingId === borrow.id ? fuelUsedLiters : ''}
                        onChange={(e) => {
                          setFuelUsedLiters(e.target.value);
                          setApprovingId(borrow.id);
                        }}
                        placeholder="เช่น 20.5"
                      />
                    </div>
                    <button
                      onClick={() => handleApprove(borrow.id)}
                      disabled={approvingId === borrow.id && (!startMileage || parseInt(startMileage) <= 0)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      อนุมัติ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

