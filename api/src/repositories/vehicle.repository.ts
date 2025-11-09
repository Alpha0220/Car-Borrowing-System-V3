import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { vehicles, type Vehicle, type NewVehicle } from '../../drizzle/schema';

export class VehicleRepository {
  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const result = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.licensePlate, licensePlate))
      .limit(1);
    return result[0] || null;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return result[0] || null;
  }

  async findAll(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async create(data: NewVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const result = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
    return result[0];
  }
}

