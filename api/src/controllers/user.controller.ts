import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UserRepository } from '../repositories/user.repository';
import { createUserSchema } from '../schemas/user.schema';

const userRepo = new UserRepository();

export class UserController {
  async create(req: AuthRequest, res: Response) {
    try {
      const validated = createUserSchema.parse(req.body);
      const { name, employeeId, role } = validated;

      // Check if employee ID already exists
      const existing = await userRepo.findByEmployeeId(employeeId);
      if (existing) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }

      // Create user without password (will be set during registration)
      const user = await userRepo.create({
        name,
        employeeId,
        role: role || 'EMPLOYEE',
        password: '', // Empty password, will be set during registration
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const users = await userRepo.findAll();
      res.json(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          employeeId: u.employeeId,
          role: u.role,
          createdAt: u.createdAt,
        }))
      );
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await userRepo.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

