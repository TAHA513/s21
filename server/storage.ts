import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Customer operations
  async getCustomers(): Promise<schema.Customer[]> {
    return await db.select().from(schema.customers);
  }

  async getCustomer(id: number): Promise<schema.Customer | undefined> {
    const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
    return customer;
  }

  async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
    const [newCustomer] = await db.insert(schema.customers).values(customer).returning();
    return newCustomer;
  }

  // Appointment operations
  async getAppointments(): Promise<schema.Appointment[]> {
    return await db.select().from(schema.appointments);
  }

  async getAppointment(id: number): Promise<schema.Appointment | undefined> {
    const [appointment] = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id));
    return appointment;
  }

  async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
    const [newAppointment] = await db.insert(schema.appointments).values(appointment).returning();
    return newAppointment;
  }

  // Product operations
  async getProducts(): Promise<schema.Product[]> {
    return await db.select().from(schema.products);
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return product;
  }

  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    const productWithStringNumbers = {
      ...product,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
    };
    const [newProduct] = await db.insert(schema.products).values(productWithStringNumbers).returning();
    return newProduct;
  }

  // Product Group operations
  async getProductGroups(): Promise<schema.ProductGroup[]> {
    return await db.select().from(schema.productGroups);
  }

  async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
    const [group] = await db.select().from(schema.productGroups).where(eq(schema.productGroups.id, id));
    return group;
  }

  async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
    const [newGroup] = await db.insert(schema.productGroups).values(group).returning();
    return newGroup;
  }

  // Invoice operations
  async getInvoices(): Promise<schema.Invoice[]> {
    return await db.select().from(schema.invoices);
  }

  async getInvoice(id: number): Promise<schema.Invoice | undefined> {
    const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
    const invoiceWithStringNumbers = {
      ...invoice,
      subtotal: invoice.subtotal.toString(),
      discount: invoice.discount.toString(),
      discountAmount: invoice.discountAmount.toString(),
      finalTotal: invoice.finalTotal.toString(),
    };
    const [newInvoice] = await db.insert(schema.invoices).values(invoiceWithStringNumbers).returning();
    return newInvoice;
  }

  // Installment Plan operations
  async getInstallmentPlans(): Promise<schema.InstallmentPlan[]> {
    return await db.select().from(schema.installmentPlans);
  }

  async getInstallmentPlan(id: number): Promise<schema.InstallmentPlan | undefined> {
    const [plan] = await db.select().from(schema.installmentPlans).where(eq(schema.installmentPlans.id, id));
    return plan;
  }

  async createInstallmentPlan(plan: schema.InsertInstallmentPlan): Promise<schema.InstallmentPlan> {
    const planWithStringNumbers = {
      ...plan,
      totalAmount: plan.totalAmount.toString(),
    };
    const [newPlan] = await db.insert(schema.installmentPlans).values(planWithStringNumbers).returning();
    return newPlan;
  }

  // Installment Payment operations
  async getInstallmentPayments(planId: number): Promise<schema.InstallmentPayment[]> {
    return await db.select().from(schema.installmentPayments).where(eq(schema.installmentPayments.planId, planId));
  }

  async createInstallmentPayment(payment: schema.InsertInstallmentPayment): Promise<schema.InstallmentPayment> {
    const paymentWithStringNumbers = {
      ...payment,
      amount: payment.amount.toString(),
    };
    const [newPayment] = await db.insert(schema.installmentPayments).values(paymentWithStringNumbers).returning();
    return newPayment;
  }

  // Marketing Campaign operations
  async getMarketingCampaigns(): Promise<schema.MarketingCampaign[]> {
    return await db.select().from(schema.marketingCampaigns);
  }

  async getMarketingCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
    const [campaign] = await db.select().from(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
    return campaign;
  }

  async createMarketingCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    const [newCampaign] = await db.insert(schema.marketingCampaigns).values(campaign).returning();
    return newCampaign;
  }

  // Scheduled Post operations
  async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
    return await db.select().from(schema.scheduledPosts).where(eq(schema.scheduledPosts.campaignId, campaignId));
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    const [newPost] = await db.insert(schema.scheduledPosts).values(post).returning();
    return newPost;
  }

  // Discount Code operations
  async getDiscountCodes(): Promise<schema.DiscountCode[]> {
    return await db.select().from(schema.discountCodes);
  }

  async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
    const [code] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.id, id));
    return code;
  }

  async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
    const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.code, code));
    return discountCode;
  }

  async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
    const codeWithStringNumbers = {
      ...code,
      discountPercentage: code.discountPercentage.toString(),
    };
    const [newCode] = await db.insert(schema.discountCodes).values(codeWithStringNumbers).returning();
    return newCode;
  }

  // Purchase Order operations
  async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
    return await db.select().from(schema.purchaseOrders);
  }

  async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
    const [order] = await db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
    return order;
  }

  async createPurchaseOrder(order: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
    const orderWithStringNumbers = {
      ...order,
      totalAmount: order.totalAmount.toString(),
    };
    const [newOrder] = await db.insert(schema.purchaseOrders).values(orderWithStringNumbers).returning();
    return newOrder;
  }
}

export const storage = new DatabaseStorage();