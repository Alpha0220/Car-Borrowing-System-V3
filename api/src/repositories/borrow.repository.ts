import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { borrows, type Borrow, type NewBorrow } from '../../drizzle/schema';
import { db } from '../config/database';

export interface BorrowFilters {
  userId?: string;
  vehicleId?: string;
  status?: 'PENDING' | 'APPROVED' | 'IN_USE' | 'RETURNED';
  borrowDateFrom?: Date;
  borrowDateTo?: Date;
  returnDateFrom?: Date;
  returnDateTo?: Date;
  employeeId?: string;
  licensePlate?: string;
}

export class BorrowRepository {
  async findById(id: string): Promise<Borrow | null> {
    const result = await db.select().from(borrows).where(eq(borrows.id, id)).limit(1);
    return result[0] || null;
  }

  async create(data: NewBorrow): Promise<Borrow> {
    const result = await db.insert(borrows).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<Borrow>): Promise<Borrow> {
    const result = await db.update(borrows).set(data).where(eq(borrows.id, id)).returning();
    return result[0];
  }

  async findByUserId(userId: string): Promise<Borrow[]> {
    return await db
      .select()
      .from(borrows)
      .where(eq(borrows.userId, userId))
      .orderBy(desc(borrows.createdAt));
  }

  async findPending(): Promise<Borrow[]> {
    return await db
      .select()
      .from(borrows)
      .where(eq(borrows.status, 'PENDING'))
      .orderBy(desc(borrows.createdAt));
  }

  async findLatestByVehicle(vehicleId: string): Promise<Borrow | null> {
    const result = await db
      .select()
      .from(borrows)
      .where(eq(borrows.vehicleId, vehicleId))
      .orderBy(desc(borrows.borrowDate))
      .limit(1);

    return result[0] || null;
  }

  async findAllWithFilters(filters: BorrowFilters): Promise<Borrow[]> {
    let query = db.select().from(borrows);

    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(borrows.userId, filters.userId));
    }

    if (filters.vehicleId) {
      conditions.push(eq(borrows.vehicleId, filters.vehicleId));
    }

    if (filters.status) {
      conditions.push(eq(borrows.status, filters.status));
    }

    if (filters.borrowDateFrom) {
      conditions.push(gte(borrows.borrowDate, filters.borrowDateFrom));
    }

    if (filters.borrowDateTo) {
      conditions.push(lte(borrows.borrowDate, filters.borrowDateTo));
    }

    if (filters.returnDateFrom) {
      conditions.push(gte(borrows.returnDate, filters.returnDateFrom));
    }

    if (filters.returnDateTo) {
      conditions.push(lte(borrows.returnDate, filters.returnDateTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(borrows.createdAt));
  }
}

