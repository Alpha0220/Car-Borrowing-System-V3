import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { borrows, notifications, users, vehicles } from './schema';

dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/creatus_car';
const superAdminUsername = process.env.SA_EMPLOYEE_ID || 'superadmin@demo.com';
const superAdminPassword = process.env.SA_PASSWORD || 'P@ss1234';
const demoPassword = process.env.MOCK_USER_PASSWORD || 'P@ss1234';

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

const daysAgo = (days: number, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function seed() {
  const [superAdminHash, demoHash] = await Promise.all([
    bcrypt.hash(superAdminPassword, 10),
    bcrypt.hash(demoPassword, 10),
  ]);

  const userSeeds = [
    { name: 'Super Admin', employeeId: superAdminUsername, password: superAdminHash, role: 'SUPER_ADMIN' as const },
    { name: 'สมชาย ผู้จัดการ', employeeId: 'manager@demo.com', password: demoHash, role: 'MANAGER' as const },
    { name: 'อนันต์ ใจดี', employeeId: 'employee1@demo.com', password: demoHash, role: 'EMPLOYEE' as const },
    { name: 'สุดา ขยันงาน', employeeId: 'employee2@demo.com', password: demoHash, role: 'EMPLOYEE' as const },
    { name: 'กิตติ มีวินัย', employeeId: 'employee3@demo.com', password: demoHash, role: 'EMPLOYEE' as const },
  ];

  const seededUsers = new Map<string, string>();
  for (const user of userSeeds) {
    const [result] = await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.employeeId,
        set: {
          name: user.name,
          password: user.password,
          role: user.role,
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id, employeeId: users.employeeId });
    seededUsers.set(result.employeeId, result.id);
  }

  const vehicleSeeds = [
    { licensePlate: 'กข 1234 กรุงเทพฯ', status: 'AVAILABLE' as const, easypassBalance: '1500.00' },
    { licensePlate: 'ฮล 5678 กรุงเทพฯ', status: 'AVAILABLE' as const, easypassBalance: '820.50' },
    { licensePlate: '3กท 9012 กรุงเทพฯ', status: 'IN_USE' as const, easypassBalance: '640.00' },
    { licensePlate: 'ขค 3456 ชลบุรี', status: 'BROKEN' as const, easypassBalance: '250.00' },
    { licensePlate: 'งจ 7890 กรุงเทพฯ', status: 'AVAILABLE' as const, easypassBalance: '2100.00' },
    { licensePlate: '1ขร 2468 นนทบุรี', status: 'AVAILABLE' as const, easypassBalance: '975.25' },
  ];

  const seededVehicles = new Map<string, string>();
  for (const vehicle of vehicleSeeds) {
    const [result] = await db
      .insert(vehicles)
      .values(vehicle)
      .onConflictDoUpdate({
        target: vehicles.licensePlate,
        set: {
          status: vehicle.status,
          easypassBalance: vehicle.easypassBalance,
          updatedAt: new Date(),
        },
      })
      .returning({ id: vehicles.id, licensePlate: vehicles.licensePlate });
    seededVehicles.set(result.licensePlate, result.id);
  }

  const borrowSeeds = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      userId: seededUsers.get('employee1@demo.com')!,
      vehicleId: seededVehicles.get('กข 1234 กรุงเทพฯ')!,
      borrowDate: daysAgo(0, 13),
      status: 'PENDING' as const,
      startMileage: 45210,
    },
    {
      id: '10000000-0000-4000-8000-000000000002',
      userId: seededUsers.get('employee2@demo.com')!,
      vehicleId: seededVehicles.get('ฮล 5678 กรุงเทพฯ')!,
      borrowDate: daysAgo(1, 10),
      status: 'APPROVED' as const,
      startMileage: 31840,
    },
    {
      id: '10000000-0000-4000-8000-000000000003',
      userId: seededUsers.get('employee3@demo.com')!,
      vehicleId: seededVehicles.get('3กท 9012 กรุงเทพฯ')!,
      borrowDate: daysAgo(0, 8),
      status: 'IN_USE' as const,
      startMileage: 67220,
    },
    {
      id: '10000000-0000-4000-8000-000000000004',
      userId: seededUsers.get('employee1@demo.com')!,
      vehicleId: seededVehicles.get('งจ 7890 กรุงเทพฯ')!,
      borrowDate: daysAgo(7, 9),
      returnDate: daysAgo(7, 18),
      status: 'RETURNED' as const,
      startMileage: 22800,
      endMileage: 22935,
      fuelUsedLiters: '12.50',
    },
    {
      id: '10000000-0000-4000-8000-000000000005',
      userId: seededUsers.get('employee2@demo.com')!,
      vehicleId: seededVehicles.get('1ขร 2468 นนทบุรี')!,
      borrowDate: daysAgo(14, 8),
      returnDate: daysAgo(14, 17),
      status: 'RETURNED' as const,
      startMileage: 18900,
      endMileage: 19082,
      fuelUsedLiters: '16.20',
    },
  ];

  for (const borrow of borrowSeeds) {
    await db
      .insert(borrows)
      .values(borrow)
      .onConflictDoUpdate({
        target: borrows.id,
        set: { ...borrow, updatedAt: new Date() },
      });
  }

  const notificationSeeds = [
    {
      id: '20000000-0000-4000-8000-000000000001',
      userId: seededUsers.get('employee1@demo.com')!,
      message: 'ส่งคำขอยืมรถเรียบร้อยแล้ว กรุณารอผู้จัดการอนุมัติ',
      type: 'INFO' as const,
      isRead: false,
    },
    {
      id: '20000000-0000-4000-8000-000000000002',
      userId: seededUsers.get('employee2@demo.com')!,
      message: 'คำขอยืมรถของคุณได้รับการอนุมัติแล้ว',
      type: 'SUCCESS' as const,
      isRead: false,
    },
    {
      id: '20000000-0000-4000-8000-000000000003',
      userId: seededUsers.get('employee3@demo.com')!,
      message: 'กรุณาตรวจสอบระยะทางและน้ำมันก่อนคืนรถ',
      type: 'WARNING' as const,
      isRead: false,
    },
    {
      id: '20000000-0000-4000-8000-000000000004',
      userId: seededUsers.get('employee1@demo.com')!,
      message: 'คืนรถเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ',
      type: 'SUCCESS' as const,
      isRead: true,
    },
  ];

  for (const notification of notificationSeeds) {
    await db
      .insert(notifications)
      .values(notification)
      .onConflictDoUpdate({
        target: notifications.id,
        set: notification,
      });
  }

  console.log('Mock data seeded:', {
    users: userSeeds.length,
    vehicles: vehicleSeeds.length,
    borrows: borrowSeeds.length,
    notifications: notificationSeeds.length,
  });
}

seed()
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
