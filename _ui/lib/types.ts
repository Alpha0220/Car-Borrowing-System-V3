export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN';
export type BorrowStatus = 'PENDING' | 'APPROVED' | 'IN_USE' | 'RETURNED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface User {
  id: string;
  name: string;
  employeeId: string;
  role: UserRole;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  status: VehicleStatus;
  easypassBalance: string;
  createdAt: string;
  updatedAt: string;
}

export interface Borrow {
  id: string;
  userId: string;
  vehicleId: string;
  borrowDate: string;
  returnDate?: string;
  status: BorrowStatus;
  startMileage?: number;
  endMileage?: number;
  fuelUsedLiters?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface VehicleSummary {
  vehicle: Vehicle;
  latestBorrow: Borrow | null;
  latestMileage: number | null;
  lastUpdatedAt: string;
}


