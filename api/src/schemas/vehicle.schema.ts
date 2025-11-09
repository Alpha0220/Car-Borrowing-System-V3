import { z } from 'zod';

export const createVehicleSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  easypassBalance: z.number().nonnegative().optional(),
});

export const updateVehicleSchema = z.object({
  status: z.enum(['AVAILABLE', 'IN_USE', 'BROKEN']).optional(),
  easypassBalance: z.number().nonnegative().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

