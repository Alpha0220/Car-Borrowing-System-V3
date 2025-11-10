'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getReports } from '@/lib/actions/borrow.action';
import { getVehicles } from '@/lib/actions/vehicle.action';
import { getUsers } from '@/lib/actions/user.action';
import { Borrow, Vehicle, User } from '@/lib/types';

export default function ReportsPage() {
  const router = useRouter();
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    borrowDateFrom: '',
    borrowDateTo: '',
  });

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
      const [borrowsData, vehiclesData, usersData] = await Promise.all([
        getReports(filters),
        getVehicles(),
        getUsers(),
      ]);
      setBorrows(borrowsData);
      setVehicles(vehiclesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    fetchData();
  }, [filters]);

  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.licensePlate || 'N/A';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'N/A';
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
        <h2 className="text-3xl font-bold mb-6">รายงานการเบิกรถ</h2>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">ตัวกรอง</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">ทั้งหมด</option>
                <option value="PENDING">รออนุมัติ</option>
                <option value="APPROVED">อนุมัติแล้ว</option>
                <option value="IN_USE">กำลังใช้งาน</option>
                <option value="RETURNED">คืนแล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เบิกจาก</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.borrowDateFrom}
                onChange={(e) => setFilters({ ...filters, borrowDateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เบิกถึง</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.borrowDateTo}
                onChange={(e) => setFilters({ ...filters, borrowDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {borrows.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ทะเบียน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่เบิก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่คืน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrows.map((borrow) => (
                  <tr key={borrow.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserName(borrow.userId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getVehiclePlate(borrow.vehicleId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(borrow.borrowDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStatusText(borrow.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

