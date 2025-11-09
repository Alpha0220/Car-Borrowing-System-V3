import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users, type User, type NewUser } from '../../drizzle/schema';

export class UserRepository {
  async findByEmployeeId(employeeId: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.employeeId, employeeId)).limit(1);
    return result[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async create(data: NewUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }

  async findAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }
}

