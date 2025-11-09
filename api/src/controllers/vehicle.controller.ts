import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehicle.schema';

const vehicleRepo = new VehicleRepository();

export class VehicleController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const vehicles = await vehicleRepo.findAll();
      res.json(vehicles);
    } catch (error) {
      console.error('Get vehicles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleRepo.findById(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const validated = createVehicleSchema.parse(req.body);
      const { licensePlate, easypassBalance } = validated;

      // Check if license plate already exists
      const existing = await vehicleRepo.findByLicensePlate(licensePlate);
      if (existing) {
        return res.status(400).json({ error: 'License plate already exists' });
      }

      const vehicle = await vehicleRepo.create({
        licensePlate,
        easypassBalance: easypassBalance?.toString() || '0',
        status: 'AVAILABLE',
      });

      res.status(201).json(vehicle);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateVehicleSchema.parse(req.body);

      const vehicle = await vehicleRepo.findById(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      const updateData: any = {};
      if (validated.status) updateData.status = validated.status;
      if (validated.easypassBalance !== undefined) {
        updateData.easypassBalance = validated.easypassBalance.toString();
      }

      const updated = await vehicleRepo.update(id, updateData);
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Update vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

