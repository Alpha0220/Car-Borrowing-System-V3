import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const userRepo = new UserRepository();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validated = registerSchema.parse(req.body);
      const { employeeId, password } = validated;

      // Check if employee ID exists (must be created by SA first)
      const existingUser = await userRepo.findByEmployeeId(employeeId);
      if (!existingUser) {
        return res.status(404).json({ error: 'Employee ID not found. Please contact administrator.' });
      }

      // Check if already registered
      if (existingUser.password && existingUser.password !== '') {
        return res.status(400).json({ error: 'Employee ID already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with password
      await userRepo.updatePassword(existingUser.id, hashedPassword);

      res.status(201).json({ message: 'Registration successful' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // async login(req: Request, res: Response) {
  //   try {
  //     const validated = loginSchema.parse(req.body);
  //     const { employeeId, password } = validated;

  //     const user = await userRepo.findByEmployeeId(employeeId);
  //     if (!user || !user.password) {
  //       return res.status(401).json({ error: 'Invalid credentials' });
  //     }

  //     const isValid = await bcrypt.compare(password, user.password);
  //     if (!isValid) {
  //       return res.status(401).json({ error: 'Invalid credentials' });
  //     }

  //     const signOptions: SignOptions = {
  //       expiresIn: parseInt(env.jwtExpiresIn as string, 10),
  //     };
  //     const token = jwt.sign(
  //       {
  //         id: user.id,
  //         employeeId: user.employeeId,
  //         role: user.role,
  //       },
  //       env.jwtSecret,
  //       signOptions
  //     );

  //     res.json({
  //       token,
  //       user: {
  //         id: user.id,
  //         employeeId: user.employeeId,
  //         name: user.name,
  //         role: user.role,
  //       },
  //     });
  //   } catch (error: any) {
  //     if (error.name === 'ZodError') {
  //       return res.status(400).json({ error: error.errors });
  //     }
  //     console.error('Login error:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // }
  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const { employeeId, password } = validated;

      // ตรวจสอบ username และ password กับค่าใน env สำหรับ SA
      if (employeeId === env.saEmployeeId && password === env.saPassword) {
        const saToken = jwt.sign(
          {
            employeeId,
            role: 'SA',
          },
          env.jwtSecret,
          { expiresIn: parseInt(env.jwtExpiresIn as string, 10) }
        );

        return res.json({
          token: saToken,
          user: {
            employeeId,
            role: 'SA',
          },
        });
      }

      // ตรวจสอบปกติในฐานข้อมูล
      const user = await userRepo.findByEmployeeId(employeeId);
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const signOptions: SignOptions = {
        expiresIn: parseInt(env.jwtExpiresIn as string, 10),
      };
      const token = jwt.sign(
        {
          id: user.id,
          employeeId: user.employeeId,
          role: user.role,
        },
        env.jwtSecret,
        signOptions
      );

      res.json({
        token,
        user: {
          id: user.id,
          employeeId: user.employeeId,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

