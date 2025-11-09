import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { NotificationRepository } from '../repositories/notification.repository';

const notificationRepo = new NotificationRepository();

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response) {
    try {
      const notifications = await notificationRepo.findByUserId(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationRepo.markAsRead(id, req.user!.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await notificationRepo.markAllAsRead(req.user!.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

