import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

