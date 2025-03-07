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

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  notes: text("notes"),
  status: text("status").notNull(),
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

// ExpenseCategory table
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Expense table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  amount: text("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Supplier table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// DatabaseConnection table
export const databaseConnections = pgTable("database_connections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: text("port").notNull(),
  database: text("database").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Installment Plans table
export const installmentPlans = pgTable("installment_plans", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  totalAmount: text("total_amount").notNull(),
  numberOfInstallments: integer("number_of_installments").notNull(),
  startDate: timestamp("start_date").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Installment Payments table
export const installmentPayments = pgTable("installment_payments", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => installmentPlans.id),
  amount: text("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketing Campaigns table
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Scheduled Posts table
export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id),
  content: text("content").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Discount Codes table
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountPercentage: text("discount_percentage").notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  orderDate: timestamp("order_date").notNull(),
  totalAmount: text("total_amount").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductGroup = typeof productGroups.$inferSelect;
export type InsertProductGroup = z.infer<typeof insertProductGroupSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type DatabaseConnection = typeof databaseConnections.$inferSelect;
export type InsertDatabaseConnection = z.infer<typeof insertDatabaseConnectionSchema>;
export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type InsertInstallmentPlan = z.infer<typeof insertInstallmentPlanSchema>;
export type InstallmentPayment = typeof installmentPayments.$inferSelect;
export type InsertInstallmentPayment = z.infer<typeof insertInstallmentPaymentSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;


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

export const insertAppointmentSchema = createInsertSchema(appointments);

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

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);

export const insertExpenseSchema = createInsertSchema(expenses).extend({
  amount: z.number().positive("المبلغ يجب أن يكون رقماً موجباً"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).extend({
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().nullable(),
});

export const insertDatabaseConnectionSchema = createInsertSchema(databaseConnections).extend({
  port: z.string().regex(/^\d+$/, "رقم المنفذ يجب أن يكون رقماً"),
});

export const insertInstallmentPlanSchema = createInsertSchema(installmentPlans).extend({
  totalAmount: z.number().positive("المبلغ الإجمالي يجب أن يكون رقماً موجباً"),
  numberOfInstallments: z.number().positive("عدد الأقساط يجب أن يكون رقماً موجباً"),
});

export const insertInstallmentPaymentSchema = createInsertSchema(installmentPayments).extend({
  amount: z.number().positive("مبلغ القسط يجب أن يكون رقماً موجباً"),
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns);

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts);

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).extend({
  discountPercentage: z.number().min(0).max(100, "نسبة الخصم يجب أن تكون بين 0 و 100"),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).extend({
  totalAmount: z.number().positive("المبلغ الإجمالي يجب أن يكون رقماً موجباً"),
});