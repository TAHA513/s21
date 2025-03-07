import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;

  // Customer operations
  getCustomers(): Promise<schema.Customer[]>;
  getCustomer(id: number): Promise<schema.Customer | undefined>;
  createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer>;
  updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Appointment operations
  getAppointments(): Promise<schema.Appointment[]>;
  getAppointment(id: number): Promise<schema.Appointment | undefined>;
  createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment>;
  updateAppointment(id: number, appointment: Partial<schema.InsertAppointment>): Promise<schema.Appointment>;
  deleteAppointment(id: number): Promise<void>;

  // Product Group operations
  getProductGroups(): Promise<schema.ProductGroup[]>;
  getProductGroup(id: number): Promise<schema.ProductGroup | undefined>;
  createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup>;
  updateProductGroup(id: number, group: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup>;
  deleteProductGroup(id: number): Promise<void>;

  // Product operations
  getProducts(): Promise<schema.Product[]>;
  getProduct(id: number): Promise<schema.Product | undefined>;
  getProductByBarcode(barcode: string): Promise<schema.Product | undefined>;
  createProduct(product: schema.InsertProduct): Promise<schema.Product>;
  updateProduct(id: number, product: Partial<schema.InsertProduct>): Promise<schema.Product>;
  deleteProduct(id: number): Promise<void>;

  // Invoice operations
  getInvoices(): Promise<schema.Invoice[]>;
  getInvoice(id: number): Promise<schema.Invoice | undefined>;
  createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice>;

  // Marketing Campaign operations
  getMarketingCampaigns(): Promise<schema.MarketingCampaign[]>;
  getMarketingCampaign(id: number): Promise<schema.MarketingCampaign | undefined>;
  createMarketingCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign>;
  updateMarketingCampaign(id: number, campaign: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign>;
  deleteCampaign(id: number): Promise<void>;

  // Scheduled Post operations
  getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]>;
  createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost>;
  updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost>;
  getPendingScheduledPosts():Promise<schema.ScheduledPost[]>;
}

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

  async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
    const [updatedCustomer] = await db
      .update(schema.customers)
      .set(customer)
      .where(eq(schema.customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(schema.customers).where(eq(schema.customers.id, id));
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

  async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
    const [updatedAppointment] = await db
      .update(schema.appointments)
      .set(updates)
      .where(eq(schema.appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(schema.appointments).where(eq(schema.appointments.id, id));
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

  async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
    const [updatedGroup] = await db
      .update(schema.productGroups)
      .set(updates)
      .where(eq(schema.productGroups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteProductGroup(id: number): Promise<void> {
    await db.delete(schema.productGroups).where(eq(schema.productGroups.id, id));
  }

  // Product operations
  async getProducts(): Promise<schema.Product[]> {
    return await db.select().from(schema.products);
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return product;
  }

  async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.barcode, barcode));
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

  async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
    const updatesWithStringNumbers = {
      ...updates,
      ...(updates.costPrice && { costPrice: updates.costPrice.toString() }),
      ...(updates.sellingPrice && { sellingPrice: updates.sellingPrice.toString() }),
      ...(updates.quantity && { quantity: updates.quantity.toString() }),
    };
    const [updatedProduct] = await db
      .update(schema.products)
      .set(updatesWithStringNumbers)
      .where(eq(schema.products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
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

  // Store Settings operations
  async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
    const [settings] = await db.select().from(schema.storeSettings);
    return settings;
  }

  async updateStoreSettings(settings: {
    storeName: string;
    storeLogo?: string;
  }): Promise<schema.StoreSetting> {
    const [updatedSettings] = await db
      .insert(schema.storeSettings)
      .values({
        ...settings,
        id: 1,
      })
      .onConflictDoUpdate({
        target: schema.storeSettings.id,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return updatedSettings;
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

  async updateMarketingCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    const [updatedCampaign] = await db
      .update(schema.marketingCampaigns)
      .set(updates)
      .where(eq(schema.marketingCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
  }

  // Scheduled Post operations
  async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
    return await db
      .select()
      .from(schema.scheduledPosts)
      .where(eq(schema.scheduledPosts.campaignId, campaignId));
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    const [newPost] = await db
      .insert(schema.scheduledPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost> {
    const [updatedPost] = await db
      .update(schema.scheduledPosts)
      .set(post)
      .where(eq(schema.scheduledPosts.id, id))
      .returning();
    return updatedPost;
  }

  async getPendingScheduledPosts(): Promise<schema.ScheduledPost[]> {
    return await db
      .select()
      .from(schema.scheduledPosts)
      .where(eq(schema.scheduledPosts.status, 'pending'))
      .orderBy(schema.scheduledPosts.scheduledTime);
  }
}

export const storage = new DatabaseStorage();