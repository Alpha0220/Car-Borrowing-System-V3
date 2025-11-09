import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import { notifications, type Notification, type NewNotification } from '../../drizzle/schema';

export class NotificationRepository {
  async create(data: NewNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(data).returning();
    return result[0];
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }
}

