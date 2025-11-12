'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/actions/auth.action';

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(employeeId, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.3),_transparent_60%)]" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-10 rounded-3xl bg-white/70 p-10 shadow-2xl shadow-brand-500/10 ring-1 ring-brand-100 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-100/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.4em] text-brand-700">
                Creatus Mobility
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
                ระบบจองรถองค์กรที่ออกแบบมาให้ใช้งานง่าย
              </h1>
              <p className="mt-4 text-base text-slate-600 lg:text-lg">
                เข้าสู่ระบบเพื่อจัดการคำขอเบิกรถ ติดตามสถานะ และบริหารทรัพยากรยานพาหนะอย่างเป็นระบบ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-100/60 p-4 ring-1 ring-white/60">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 shadow-sm">
                🚗
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-700">อัปเดตสถานะรถทุกครั้ง</p>
                <p className="text-xs text-slate-500">ข้อมูลพร้อมใช้งานทันทีสำหรับผู้จัดการและผู้ดูแลระบบ</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-brand-500/10 ring-1 ring-brand-100 backdrop-blur">
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
                    <path d="M9 10h.01" />
                    <path d="M15 10h.01" />
                    <path d="M9.5 15a3.5 3.5 0 0 1 5 0" />
                  </svg>
                </span>
                <h2 className="mt-6 text-3xl font-semibold text-slate-900">เข้าสู่ระบบ</h2>
                <p className="mt-2 text-sm text-slate-500">กรอกรหัสพนักงานและรหัสผ่านเพื่อเริ่มใช้งาน</p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-600 shadow-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <label htmlFor="employeeId" className="text-sm font-medium text-slate-700">
                    รหัสพนักงาน
                  </label>
                  <div className="relative">
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      required
                      className="block w-full rounded-2xl border border-transparent bg-slate-100/70 px-4 py-3 text-slate-900 shadow-inner shadow-white/40 transition hover:bg-slate-100 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      🪪
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      className="block w-full rounded-2xl border border-transparent bg-slate-100/70 px-4 py-3 text-slate-900 shadow-inner shadow-white/40 transition hover:bg-slate-100 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      🔒
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-[1px] hover:shadow-brand-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:translate-y-0 disabled:opacity-60"
                >
                  <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>

                <div className="text-center text-sm text-slate-500">
                  ยังไม่มีบัญชี?{' '}
                  <a
                    href="/register"
                    className="font-semibold text-brand-600 underline-offset-4 transition hover:text-brand-500 hover:underline"
                  >
                    สมัครสมาชิก
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

