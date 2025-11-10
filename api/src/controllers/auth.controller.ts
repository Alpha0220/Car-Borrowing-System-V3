import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const userRepo = new UserRepository();

export class AuthController {
  async register(req: Request, res: Response) {
    console.log(env.saEmployeeId, env.saPassword, "register");
    // log to terminal
    console.log(env.saEmployeeId, env.saPassword, "register");
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

  async SAlogin(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const { employeeId, password } = validated;

      const user = await userRepo.findByEmployeeId(employeeId);
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials3' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials4' });
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
  

  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const { employeeId, password } = validated;
  
      // ตรวจสอบว่าเป็นการล็อกอินของ Super Admin (SA) หรือไม่
      if (employeeId === env.saEmployeeId) {
        // ค้นหาผู้ใช้ในฐานข้อมูลที่มี employeeId เท่ากับ "SA"
        let saUser = await userRepo.findByEmployeeId(employeeId);
  
        // ถ้าไม่มี user SA ในฐานข้อมูลให้สร้างใหม่
        if (!saUser) {
          console.log('SA user not found, creating new SA user...');
      
          // Hash รหัสผ่าน
          const hashedPassword = await bcrypt.hash(env.saPassword, 10);
  
          // สร้าง SA user ใหม่
          saUser = await userRepo.create({
            employeeId: env.saEmployeeId,
            password: hashedPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
  
        // เปรียบเทียบรหัสผ่านที่ได้รับจากผู้ใช้กับรหัสผ่านที่เก็บในฐานข้อมูล
        const isValid = await bcrypt.compare(password, saUser.password);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid SA credentials' });
        }

      console.log ("create sa user");
  
        // สร้าง JWT token สำหรับ SA
        const signOptions: SignOptions = {
          expiresIn: parseInt(env.jwtExpiresIn as string, 10),
        };
        const token = jwt.sign(
          {
            id: saUser.id,
            employeeId: saUser.employeeId,
            role: 'SUPER_ADMIN',
          },
          env.jwtSecret,
          signOptions
        );
  
        return res.json({
          token,
          user: {
            id: saUser.id,
            employeeId: saUser.employeeId,
            name: saUser.name,
            role: 'SUPER_ADMIN',
          },
        });
      }
  
      // ถ้าไม่ใช่ SA ให้ทำการตรวจสอบผู้ใช้ทั่วไป
      const user = await userRepo.findByEmployeeId(employeeId);
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials1',employeeId: employeeId,password: password });
      }
  
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials2',employeeId: employeeId,password: password });
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

