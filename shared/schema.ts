import { pgTable, text, serial, integer, timestamp, decimal, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Basic user table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  barcode: text("barcode").unique(),
  description: text("description"),
  costPrice: text("cost_price").notNull(),
  sellingPrice: text("selling_price").notNull(),
  quantity: text("quantity").notNull(),
  groupId: integer("group_id").references(() => productGroups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Product Groups table
export const productGroups = pgTable("product_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  subtotal: text("subtotal").notNull(),
  discount: text("discount").notNull(),
  discountAmount: text("discount_amount").notNull(),
  finalTotal: text("final_total").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductGroup = typeof productGroups.$inferSelect;
export type InsertProductGroup = z.infer<typeof insertProductGroupSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const insertCustomerSchema = createInsertSchema(customers).extend({
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().nullable(),
});

export const insertProductSchema = createInsertSchema(products).extend({
  costPrice: z.number().positive("سعر التكلفة يجب أن يكون رقماً موجباً"),
  sellingPrice: z.number().positive("سعر البيع يجب أن يكون رقماً موجباً"),
  quantity: z.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
});

export const insertProductGroupSchema = createInsertSchema(productGroups);

export const insertInvoiceSchema = createInsertSchema(invoices).extend({
  subtotal: z.number().positive("المجموع الفرعي يجب أن يكون رقماً موجباً"),
  discount: z.number().min(0, "الخصم لا يمكن أن يكون سالباً"),
  discountAmount: z.number().min(0, "مبلغ الخصم لا يمكن أن يكون سالباً"),
  finalTotal: z.number().positive("المجموع النهائي يجب أن يكون رقماً موجباً"),
});