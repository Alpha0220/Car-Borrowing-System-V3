'use client';

import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleBackHome = () => {
    router.push('/dashboard');
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <button
            className='p-2 bg-red-600'
            onClick={handleBackHome}> <span className="text-sm text-black">กลับไปหน้าหลัก</span></button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Creatus Car Service</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm"
                >
                  ออกจากระบบ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

