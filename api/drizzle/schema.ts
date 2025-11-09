import { pgTable, uuid, text, varchar, timestamp, decimal, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE']);
export const vehicleStatusEnum = pgEnum('vehicle_status', ['AVAILABLE', 'IN_USE', 'BROKEN']);
export const borrowStatusEnum = pgEnum('borrow_status', ['PENDING', 'APPROVED', 'IN_USE', 'RETURNED']);
export const notificationTypeEnum = pgEnum('notification_type', ['INFO', 'SUCCESS', 'WARNING', 'ERROR']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  employeeId: varchar('employee_id', { length: 20 }).notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('EMPLOYEE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull().unique(),
  status: vehicleStatusEnum('status').notNull().default('AVAILABLE'),
  easypassBalance: decimal('easypass_balance', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Borrows table
export const borrows = pgTable('borrows', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  borrowDate: timestamp('borrow_date').notNull(),
  returnDate: timestamp('return_date'),
  status: borrowStatusEnum('status').notNull().default('PENDING'),
  startMileage: integer('start_mileage'),
  endMileage: integer('end_mileage'),
  fuelUsedLiters: decimal('fuel_used_liters', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull().default('INFO'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  borrows: many(borrows),
  notifications: many(notifications),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  borrows: many(borrows),
}));

export const borrowsRelations = relations(borrows, ({ one }) => ({
  user: one(users, {
    fields: [borrows.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [borrows.vehicleId],
    references: [vehicles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Borrow = typeof borrows.$inferSelect;
export type NewBorrow = typeof borrows.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

