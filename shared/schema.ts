import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
  name: text("name").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  staffId: integer("staff_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  specialization: text("specialization"),
  workDays: text("work_days").array(),
  workHours: text("work_hours").array(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("draft"),
  type: text("type").notNull(), // email, sms, whatsapp, facebook, instagram, snapchat
  content: text("content").notNull(),
  platforms: text("platforms").array(), // Array of social media platforms
  socialMediaSettings: text("social_media_settings"), // JSON string for platform-specific settings
  targetAudience: text("target_audience"), // JSON string for targeting options
  budget: integer("budget"), // Campaign budget in cents
  adCreatives: text("ad_creatives").array(), // Array of ad creative URLs
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: integer("discount_value").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  promotionId: integer("promotion_id").notNull(),
  customerId: integer("customer_id"),
  usageLimit: integer("usage_limit").notNull().default(1),
  usageCount: integer("usage_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // facebook, instagram, snapchat
  accountId: text("account_id").notNull(),
  accessToken: text("access_token").notNull(),
  accountName: text("account_name"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const insertCustomerSchema = createInsertSchema(customers);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertStaffSchema = createInsertSchema(staff);
export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).extend({
  platforms: z.array(z.enum(['facebook', 'instagram', 'snapchat', 'whatsapp', 'email', 'sms'])).optional(),
  socialMediaSettings: z.string().optional(),
  targetAudience: z.string().optional(),
  adCreatives: z.array(z.string()).optional(),
  budget: z.number().optional(),
});
export const insertPromotionSchema = createInsertSchema(promotions);
export const insertDiscountCodeSchema = createInsertSchema(discountCodes);
export const insertSocialMediaAccountSchema = createInsertSchema(socialMediaAccounts).pick({
  platform: true,
  accountId: true,
  accessToken: true,
  accountName: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = z.infer<typeof insertSocialMediaAccountSchema>;