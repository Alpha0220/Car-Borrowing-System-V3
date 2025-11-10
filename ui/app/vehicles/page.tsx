'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getVehicles, createVehicle } from '@/lib/actions/vehicle.action';
import { Vehicle } from '@/lib/types';

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: '',
    easypassBalance: '',
  });
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

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

    fetchVehicles();
  }, [router]);

  const fetchVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createVehicle({
        licensePlate: formData.licensePlate,
        easypassBalance: formData.easypassBalance
          ? parseFloat(formData.easypassBalance)
          : undefined,
      });
      setFormData({ licensePlate: '', easypassBalance: '' });
      setShowForm(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || 'Failed to create vehicle');
    }
  };

  const isManager = user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'BROKEN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'พร้อมใช้งาน';
      case 'IN_USE':
        return 'กำลังใช้งาน';
      case 'BROKEN':
        return 'ชำรุด';
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">สถานะรถและเงิน Easy Pass</h2>
          {isManager && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {showForm ? 'ยกเลิก' : 'เพิ่มรถ'}
            </button>
          )}
        </div>

        {showForm && isManager && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">เพิ่มรถใหม่</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ทะเบียนรถ *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licensePlate: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="เช่น กข 1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เงิน Easy Pass (บาท) (ไม่บังคับ)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.easypassBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, easypassBalance: e.target.value })
                  }
                  placeholder="เช่น 500.00"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                เพิ่มรถ
              </button>
            </form>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            ยังไม่มีข้อมูลรถ
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{vehicle.licensePlate}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                    {getStatusText(vehicle.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">เงิน Easy Pass:</span>{' '}
                    {parseFloat(vehicle.easypassBalance || '0').toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    บาท
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

