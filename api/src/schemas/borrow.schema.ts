import { z } from 'zod';

export const createBorrowSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
});

export const approveBorrowSchema = z.object({
  startMileage: z.number().int().positive('Start mileage must be positive'),
  fuelUsedLiters: z.number().positive('Fuel used must be positive').optional(),
});

export const returnBorrowSchema = z.object({
  endMileage: z.number().int().positive('End mileage must be positive'),
});

export type CreateBorrowInput = z.infer<typeof createBorrowSchema>;
export type ApproveBorrowInput = z.infer<typeof approveBorrowSchema>;
export type ReturnBorrowInput = z.infer<typeof returnBorrowSchema>;

