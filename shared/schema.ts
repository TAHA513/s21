import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Basic user table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Database connections table
export const databaseConnections = pgTable("database_connections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  host: text("host"),
  port: integer("port"),
  database: text("database"),
  username: text("username"),
  password: text("password"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Store settings table
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name"),
  storeLogo: text("store_logo"),
  defaultCurrency: text("default_currency").default("USD"),
  usdToIqdRate: integer("usd_to_iqd_rate").default(1460),
  theme: jsonb("theme").default({
    primary: "#0ea5e9",
    variant: "professional",
    appearance: "light",
    radius: 0.5
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Social media accounts table
export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Backup configurations table
export const backupConfigs = pgTable("backup_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  lastBackup: timestamp("last_backup"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type InsertDatabaseConnection = z.infer<typeof insertDatabaseConnectionSchema>;
export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;
export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = z.infer<typeof insertSocialMediaAccountSchema>;
export type BackupConfig = typeof backupConfigs.$inferSelect;
export type InsertBackupConfig = z.infer<typeof insertBackupConfigSchema>;

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const insertDatabaseConnectionSchema = createInsertSchema(databaseConnections, {
  name: z.string().min(1, "اسم الاتصال مطلوب"),
  type: z.string().min(1, "نوع قاعدة البيانات مطلوب"),
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettings);

export const insertSocialMediaAccountSchema = createInsertSchema(socialMediaAccounts, {
  platform: z.enum(["facebook", "instagram", "snapchat"], {
    required_error: "يرجى اختيار المنصة"
  }),
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const insertBackupConfigSchema = createInsertSchema(backupConfigs, {
  name: z.string().min(1, "اسم النسخة الاحتياطية مطلوب"),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    required_error: "يرجى اختيار تكرار النسخ الاحتياطي"
  }),
});