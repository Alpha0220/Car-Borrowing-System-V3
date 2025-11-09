import { db } from '../db';
import { users } from '../schema';
import bcrypt from 'bcryptjs';
import { env } from '../../src/config/env';

async function seed() {
  try {
    console.log('🌱 Seeding SA user...');
    
    // Check if SA already exists
    const existingSA = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.employeeId, env.saEmployeeId)
    });

    if (existingSA) {
      console.log('ℹ️ SA user already exists, skipping...');
      return;
    }

    // Create SA user
    const hashedPassword = await bcrypt.hash(env.saPassword, 10);
    
    await db.insert(users).values({
      employeeId: env.saEmployeeId,
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'SA',
      department: 'IT',
      phoneNumber: '',
      lineId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ SA user created successfully!');
  } catch (error) {
    console.error('❌ Error seeding SA user:', error);
    throw error;
  }
}

// Execute the seed
seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});