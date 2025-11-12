import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { BorrowRepository } from '../repositories/borrow.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { UserRepository } from '../repositories/user.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { approveBorrowSchema, createBorrowSchema, returnBorrowSchema } from '../schemas/borrow.schema';
import { GoogleSheetsService } from '../services/google-sheets.service';
import { LineMessagingService } from '../services/line-messaging.service';
import { env } from '../config/env';
import { ZodError } from 'zod';
import type { BorrowFilters } from '../repositories/borrow.repository';

const borrowRepo = new BorrowRepository();
const vehicleRepo = new VehicleRepository();
const userRepo = new UserRepository();
const notificationRepo = new NotificationRepository();
const lineMessaging = new LineMessagingService();
const googleSheets = new GoogleSheetsService();

export class BorrowController {
  async create(req: AuthRequest, res: Response) {
    try {
      const validated = createBorrowSchema.parse(req.body);
      const { licensePlate } = validated;
      const userId = req.user!.id;

      // Find vehicle
      const vehicle = await vehicleRepo.findByLicensePlate(licensePlate);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (vehicle.status !== 'AVAILABLE') {
        return res.status(400).json({ error: 'Vehicle is not available' });
      }

      // Get user info
      const user = await userRepo.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create borrow request
      const borrow = await borrowRepo.create({
        userId,
        vehicleId: vehicle.id,
        borrowDate: new Date(),
        status: 'PENDING',
      });

      // Create notification for user
      await notificationRepo.create({
        userId,
        message: `คำขอเบิกรถ ${licensePlate} ถูกส่งแล้ว รอการอนุมัติ`,
        type: 'INFO',
      });

      // Send LINE notification to managers
      const lineMessage = lineMessaging.formatBorrowRequestMessage(
        user.name,
        user.employeeId,
        licensePlate,
        borrow.borrowDate
      );
      await lineMessaging.sendNotification(env.lineGroupId, lineMessage);

      res.status(201).json(borrow);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create borrow error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async approve(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = approveBorrowSchema.parse(req.body);
      const { startMileage, fuelUsedLiters } = validated;

      const borrow = await borrowRepo.findById(id);
      if (!borrow) {
        return res.status(404).json({ error: 'Borrow request not found' });
      }

      if (borrow.status !== 'PENDING') {
        return res.status(400).json({ error: 'Borrow request is not pending' });
      }

      // Get vehicle and user
      const vehicle = await vehicleRepo.findById(borrow.vehicleId);
      const user = await userRepo.findById(borrow.userId);
      if (!vehicle || !user) {
        return res.status(404).json({ error: 'Vehicle or user not found' });
      }

      // Update borrow
      const updated = await borrowRepo.update(id, {
        status: 'APPROVED',
        startMileage,
        fuelUsedLiters: fuelUsedLiters?.toString(),
      });

      // Update vehicle status
      await vehicleRepo.update(vehicle.id, { status: 'IN_USE' });

      // Create notifications
      await notificationRepo.create({
        userId: borrow.userId,
        message: `คำขอเบิกรถ ${vehicle.licensePlate} ถูกอนุมัติแล้ว`,
        type: 'SUCCESS',
      });

      // Send LINE notification
      const lineMessage = lineMessaging.formatApprovalMessage(user.name, vehicle.licensePlate);
      await lineMessaging.sendNotification(env.lineGroupId, lineMessage);

      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Approve borrow error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async return(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = returnBorrowSchema.parse(req.body);
      const { endMileage } = validated;

      const borrow = await borrowRepo.findById(id);
      if (!borrow) {
        return res.status(404).json({ error: 'Borrow request not found' });
      }

      // Check if user owns this borrow or is manager/admin
      if (borrow.userId !== req.user!.id && !['MANAGER', 'SUPER_ADMIN'].includes(req.user!.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (borrow.status === 'RETURNED') {
        return res.status(400).json({ error: 'Vehicle already returned' });
      }

      // Get vehicle and user
      const vehicle = await vehicleRepo.findById(borrow.vehicleId);
      const user = await userRepo.findById(borrow.userId);
      if (!vehicle || !user) {
        return res.status(404).json({ error: 'Vehicle or user not found' });
      }

      const returnDate = new Date();

      // Update borrow
      const updated = await borrowRepo.update(id, {
        status: 'RETURNED',
        returnDate,
        endMileage,
      });

      // Update vehicle status
      await vehicleRepo.update(vehicle.id, { status: 'AVAILABLE' });

      // Create notification
      await notificationRepo.create({
        userId: borrow.userId,
        message: `คืนรถ ${vehicle.licensePlate} เรียบร้อยแล้ว`,
        type: 'SUCCESS',
      });

      // Send LINE notification
      const lineMessage = lineMessaging.formatReturnMessage(user.name, vehicle.licensePlate, returnDate);
      await lineMessaging.sendNotification(env.lineGroupId, lineMessage);

      // Save to Google Sheets
      await googleSheets.appendRecord({
        name: user.name,
        employeeId: user.employeeId,
        licensePlate: vehicle.licensePlate,
        borrowDate: borrow.borrowDate.toISOString(),
        returnDate: returnDate.toISOString(),
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Return borrow error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMyBorrows(req: AuthRequest, res: Response) {
    try {
      const borrows = await borrowRepo.findByUserId(req.user!.id);
      res.json(borrows);
    } catch (error) {
      console.error('Get my borrows error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPending(req: AuthRequest, res: Response) {
    try {
      const borrows = await borrowRepo.findPending();
      res.json(borrows);
    } catch (error) {
      console.error('Get pending borrows error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const filters: BorrowFilters = {};

      if (typeof req.query.userId === 'string') filters.userId = req.query.userId;
      if (typeof req.query.vehicleId === 'string') filters.vehicleId = req.query.vehicleId;
      if (typeof req.query.status === 'string') {
        filters.status = req.query.status as BorrowFilters['status'];
      }
      if (typeof req.query.borrowDateFrom === 'string') {
        filters.borrowDateFrom = new Date(req.query.borrowDateFrom);
      }
      if (typeof req.query.borrowDateTo === 'string') {
        filters.borrowDateTo = new Date(req.query.borrowDateTo);
      }
      if (typeof req.query.returnDateFrom === 'string') {
        filters.returnDateFrom = new Date(req.query.returnDateFrom);
      }
      if (typeof req.query.returnDateTo === 'string') {
        filters.returnDateTo = new Date(req.query.returnDateTo);
      }

      const borrows = await borrowRepo.findAllWithFilters(filters);
      res.json(borrows);
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

