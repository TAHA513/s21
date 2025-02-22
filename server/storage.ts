import { Pool } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { DatabaseError } from './errors';

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
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

  // Staff operations
  getStaff(): Promise<schema.Staff[]>;
  getStaffMember(id: number): Promise<schema.Staff | undefined>;
  createStaff(staff: schema.InsertStaff): Promise<schema.Staff>;
  updateStaff(id: number, staff: Partial<schema.InsertStaff>): Promise<schema.Staff>;
  deleteStaff(id: number): Promise<void>;

  // Settings operations
  getSetting(key: string): Promise<schema.Setting | undefined>;
  getSettings(): Promise<schema.Setting[]>;
  setSetting(key: string, value: string): Promise<schema.Setting>;

  // Marketing Campaign operations
  getCampaigns(): Promise<schema.MarketingCampaign[]>;
  getCampaign(id: number): Promise<schema.MarketingCampaign | undefined>;
  createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign>;
  updateCampaign(id: number, campaign: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign>;
  deleteCampaign(id: number): Promise<void>;

  // Promotion operations
  getPromotions(): Promise<schema.Promotion[]>;
  getPromotion(id: number): Promise<schema.Promotion | undefined>;
  createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion>;
  updatePromotion(id: number, promotion: Partial<schema.InsertPromotion>): Promise<schema.Promotion>;
  deletePromotion(id: number): Promise<void>;

  // Discount Code operations
  getDiscountCodes(): Promise<schema.DiscountCode[]>;
  getDiscountCode(id: number): Promise<schema.DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined>;
  createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode>;
  updateDiscountCode(id: number, code: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode>;
  deleteDiscountCode(id: number): Promise<void>;

  // Social Media Account operations
  getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]>;
  getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined>;
  createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount>;
  updateSocialMediaAccount(id: number, account: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;

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

  sessionStore: session.Store;
  // Store Settings operations
  getStoreSettings(): Promise<schema.StoreSetting | undefined>;
  updateStoreSettings(settings: { storeName: string; storeLogo?: string }): Promise<schema.StoreSetting>;

  // Supplier operations
  getSuppliers(): Promise<schema.Supplier[]>;
  getSupplier(id: number): Promise<schema.Supplier | undefined>;
  createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier>;
  updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier>;
  deleteSupplier(id: number): Promise<void>;

  // Purchase operations
  getPurchaseOrders(): Promise<schema.PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined>;
  createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder>;
  updatePurchaseOrder(id: number, purchase: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder>;
  deletePurchaseOrder(id: number): Promise<void>;
  getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]>;

  // Expense Category operations
  getExpenseCategories(): Promise<schema.ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined>;
  createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory>;
  deleteExpenseCategory(id: number): Promise<void>;

  // Expense operations
  getExpenses(): Promise<schema.Expense[]>;
  getExpense(id: number): Promise<schema.Expense | undefined>;
  createExpense(expense: schema.InsertExpense): Promise<schema.Expense>;
  updateExpense(id: number, expense: Partial<schema.InsertExpense>): Promise<schema.Expense>;
  deleteExpense(id: number): Promise<void>;

  // Database connection operations
  getDatabaseConnections(): Promise<schema.DatabaseConnection[]>;
  getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined>;
  createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection>;
  updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection>;
  deleteDatabaseConnection(id: number): Promise<void>;
  testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean>;

  // Campaign Notification operations
  getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]>;
  createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification>;
  updateCampaignNotification(id: number, notification: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification>;
  getPendingNotifications(): Promise<schema.CampaignNotification[]>;

  // Scheduled Post operations
  getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]>;
  createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost>;
  updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost>;
  getPendingScheduledPosts(): Promise<schema.ScheduledPost[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Helper method for error handling
  private handleDatabaseError(error: unknown, operation: string): never {
    console.error(`Database error during ${operation}:`, error);
    throw new DatabaseError(`Error during ${operation}`);
  }

  // User operations with improved error handling
  async getUser(id: number): Promise<schema.User | undefined> {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return user;
    } catch (error) {
      this.handleDatabaseError(error, 'getUser');
    }
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
      return user;
    } catch (error) {
      this.handleDatabaseError(error, 'getUserByUsername');
    }
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    try {
      const [newUser] = await db.insert(schema.users).values(user).returning();
      return newUser;
    } catch (error) {
      this.handleDatabaseError(error, 'createUser');
    }
  }

  // Customer operations with improved error handling and validation
  async getCustomers(): Promise<schema.Customer[]> {
    try {
      return await db.select().from(schema.customers).where(eq(schema.customers.isActive, true));
    } catch (error) {
      this.handleDatabaseError(error, 'getCustomers');
    }
  }

  async getCustomer(id: number): Promise<schema.Customer | undefined> {
    try {
      const [customer] = await db
        .select()
        .from(schema.customers)
        .where(and(
          eq(schema.customers.id, id),
          eq(schema.customers.isActive, true)
        ));
      return customer;
    } catch (error) {
      this.handleDatabaseError(error, 'getCustomer');
    }
  }

  async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
    try {
      const [newCustomer] = await db.insert(schema.customers).values(customer).returning();
      return newCustomer;
    } catch (error) {
      this.handleDatabaseError(error, 'createCustomer');
    }
  }

  async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
    try {
      const [updatedCustomer] = await db
        .update(schema.customers)
        .set({
          ...customer,
          updatedAt: new Date()
        })
        .where(and(
          eq(schema.customers.id, id),
          eq(schema.customers.isActive, true)
        ))
        .returning();
      return updatedCustomer;
    } catch (error) {
      this.handleDatabaseError(error, 'updateCustomer');
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    try {
      await db
        .update(schema.customers)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.customers.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteCustomer');
    }
  }
  async getAppointments(): Promise<schema.Appointment[]> {
    try {
      return await db.select().from(schema.appointments);
    } catch (error) {
      this.handleDatabaseError(error, 'getAppointments');
    }
  }

  async getAppointment(id: number): Promise<schema.Appointment | undefined> {
    try {
      const [appointment] = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id));
      return appointment;
    } catch (error) {
      this.handleDatabaseError(error, 'getAppointment');
    }
  }

  async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
    try {
      const [newAppointment] = await db.insert(schema.appointments).values(appointment).returning();
      return newAppointment;
    } catch (error) {
      this.handleDatabaseError(error, 'createAppointment');
    }
  }

  async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
    try {
      const [updatedAppointment] = await db
        .update(schema.appointments)
        .set(updates)
        .where(eq(schema.appointments.id, id))
        .returning();
      return updatedAppointment;
    } catch (error) {
      this.handleDatabaseError(error, 'updateAppointment');
    }
  }

  async deleteAppointment(id: number): Promise<void> {
    try {
      await db.delete(schema.appointments).where(eq(schema.appointments.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteAppointment');
    }
  }

  // Staff operations
  async getStaff(): Promise<schema.Staff[]> {
    try {
      return await db.select().from(schema.staff);
    } catch (error) {
      this.handleDatabaseError(error, 'getStaff');
    }
  }

  async getStaffMember(id: number): Promise<schema.Staff | undefined> {
    try {
      const [staff] = await db.select().from(schema.staff).where(eq(schema.staff.id, id));
      return staff;
    } catch (error) {
      this.handleDatabaseError(error, 'getStaffMember');
    }
  }

  async createStaff(staff: schema.InsertStaff): Promise<schema.Staff> {
    try {
      const [newStaff] = await db.insert(schema.staff).values(staff).returning();
      return newStaff;
    } catch (error) {
      this.handleDatabaseError(error, 'createStaff');
    }
  }

  async updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff> {
    try {
      const [updatedStaff] = await db
        .update(schema.staff)
        .set(updates)
        .where(eq(schema.staff.id, id))
        .returning();
      return updatedStaff;
    } catch (error) {
      this.handleDatabaseError(error, 'updateStaff');
    }
  }

  async deleteStaff(id: number): Promise<void> {
    try {
      await db.delete(schema.staff).where(eq(schema.staff.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteStaff');
    }
  }

  // Settings operations
  async getSetting(key: string): Promise<schema.Setting | undefined> {
    try {
      const [setting] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
      return setting;
    } catch (error) {
      this.handleDatabaseError(error, 'getSetting');
    }
  }

  async getSettings(): Promise<schema.Setting[]> {
    try {
      return await db.select().from(schema.settings);
    } catch (error) {
      this.handleDatabaseError(error, 'getSettings');
    }
  }

  async setSetting(key: string, value: string): Promise<schema.Setting> {
    try {
      const [setting] = await db
        .insert(schema.settings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value, updatedAt: new Date() },
        })
        .returning();
      return setting;
    } catch (error) {
      this.handleDatabaseError(error, 'setSetting');
    }
  }

  // Marketing Campaign operations
  async getCampaigns(): Promise<schema.MarketingCampaign[]> {
    try {
      return await db.select().from(schema.marketingCampaigns);
    } catch (error) {
      this.handleDatabaseError(error, 'getCampaigns');
    }
  }

  async getCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
    try {
      const [campaign] = await db.select().from(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
      return campaign;
    } catch (error) {
      this.handleDatabaseError(error, 'getCampaign');
    }
  }

  async createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    try {
      const [newCampaign] = await db.insert(schema.marketingCampaigns).values(campaign).returning();
      return newCampaign;
    } catch (error) {
      this.handleDatabaseError(error, 'createCampaign');
    }
  }

  async updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    try {
      const [updatedCampaign] = await db
        .update(schema.marketingCampaigns)
        .set(updates)
        .where(eq(schema.marketingCampaigns.id, id))
        .returning();
      return updatedCampaign;
    } catch (error) {
      this.handleDatabaseError(error, 'updateCampaign');
    }
  }

  async deleteCampaign(id: number): Promise<void> {
    try {
      await db.delete(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteCampaign');
    }
  }

  // Promotion operations
  async getPromotions(): Promise<schema.Promotion[]> {
    try {
      return await db.select().from(schema.promotions);
    } catch (error) {
      this.handleDatabaseError(error, 'getPromotions');
    }
  }

  async getPromotion(id: number): Promise<schema.Promotion | undefined> {
    try {
      const [promotion] = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id));
      return promotion;
    } catch (error) {
      this.handleDatabaseError(error, 'getPromotion');
    }
  }

  async createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion> {
    try {
      const [newPromotion] = await db.insert(schema.promotions).values(promotion).returning();
      return newPromotion;
    } catch (error) {
      this.handleDatabaseError(error, 'createPromotion');
    }
  }

  async updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion> {
    try {
      const [updatedPromotion] = await db
        .update(schema.promotions)
        .set(updates)
        .where(eq(schema.promotions.id, id))
        .returning();
      return updatedPromotion;
    } catch (error) {
      this.handleDatabaseError(error, 'updatePromotion');
    }
  }

  async deletePromotion(id: number): Promise<void> {
    try {
      await db.delete(schema.promotions).where(eq(schema.promotions.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deletePromotion');
    }
  }

  // Discount Code operations
  async getDiscountCodes(): Promise<schema.DiscountCode[]> {
    try {
      return await db.select().from(schema.discountCodes);
    } catch (error) {
      this.handleDatabaseError(error, 'getDiscountCodes');
    }
  }

  async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
    try {
      const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.id, id));
      return discountCode;
    } catch (error) {
      this.handleDatabaseError(error, 'getDiscountCode');
    }
  }

  async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
    try {
      const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.code, code));
      return discountCode;
    } catch (error) {
      this.handleDatabaseError(error, 'getDiscountCodeByCode');
    }
  }

  async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
    try {
      const [newDiscountCode] = await db.insert(schema.discountCodes).values(code).returning();
      return newDiscountCode;
    } catch (error) {
      this.handleDatabaseError(error, 'createDiscountCode');
    }
  }

  async updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode> {
    try {
      const [updatedDiscountCode] = await db
        .update(schema.discountCodes)
        .set(updates)
        .where(eq(schema.discountCodes.id, id))
        .returning();
      return updatedDiscountCode;
    } catch (error) {
      this.handleDatabaseError(error, 'updateDiscountCode');
    }
  }

  async deleteDiscountCode(id: number): Promise<void> {
    try {
      await db.delete(schema.discountCodes).where(eq(schema.discountCodes.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteDiscountCode');
    }
  }

  // Social Media Account operations
  async getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]> {
    try {
      return await db.select().from(schema.socialMediaAccounts);
    } catch (error) {
      this.handleDatabaseError(error, 'getSocialMediaAccounts');
    }
  }

  async getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined> {
    try {
      const [account] = await db.select().from(schema.socialMediaAccounts).where(eq(schema.socialMediaAccounts.id, id));
      return account;
    } catch (error) {
      this.handleDatabaseError(error, 'getSocialMediaAccount');
    }
  }

  async createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount> {
    try {
      const [newAccount] = await db.insert(schema.socialMediaAccounts).values(account).returning();
      return newAccount;
    } catch (error) {
      this.handleDatabaseError(error, 'createSocialMediaAccount');
    }
  }

  async updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount> {
    try {
      const [updatedAccount] = await db
        .update(schema.socialMediaAccounts)
        .set(updates)
        .where(eq(schema.socialMediaAccounts.id, id))
        .returning();
      return updatedAccount;
    } catch (error) {
      this.handleDatabaseError(error, 'updateSocialMediaAccount');
    }
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    try {
      await db.delete(schema.socialMediaAccounts).where(eq(schema.socialMediaAccounts.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteSocialMediaAccount');
    }
  }

  // Product Group operations
  async getProductGroups(): Promise<schema.ProductGroup[]> {
    try {
      return await db.select().from(schema.productGroups);
    } catch (error) {
      this.handleDatabaseError(error, 'getProductGroups');
    }
  }

  async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
    try {
      const [group] = await db.select().from(schema.productGroups).where(eq(schema.productGroups.id, id));
      return group;
    } catch (error) {
      this.handleDatabaseError(error, 'getProductGroup');
    }
  }

  async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
    try {
      const [newGroup] = await db.insert(schema.productGroups).values(group).returning();
      return newGroup;
    } catch (error) {
      this.handleDatabaseError(error, 'createProductGroup');
    }
  }

  async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
    try {
      const [updatedGroup] = await db
        .update(schema.productGroups)
        .set(updates)
        .where(eq(schema.productGroups.id, id))
        .returning();
      return updatedGroup;
    } catch (error) {
      this.handleDatabaseError(error, 'updateProductGroup');
    }
  }

  async deleteProductGroup(id: number): Promise<void> {
    try {
      await db.delete(schema.productGroups).where(eq(schema.productGroups.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteProductGroup');
    }
  }

  // Product operations
  async getProducts(): Promise<schema.Product[]> {
    try {
      return await db.select().from(schema.products);
    } catch (error) {
      this.handleDatabaseError(error, 'getProducts');
    }
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    try {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
      return product;
    } catch (error) {
      this.handleDatabaseError(error, 'getProduct');
    }
  }

  async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
    try {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.barcode, barcode));
      return product;
    } catch (error) {
      this.handleDatabaseError(error, 'getProductByBarcode');
    }
  }

  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    try {
      const productWithStringNumbers = {
        ...product,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        quantity: product.quantity.toString(),
      };
      const [newProduct] = await db.insert(schema.products).values(productWithStringNumbers).returning();
      return newProduct;
    } catch (error) {
      this.handleDatabaseError(error, 'createProduct');
    }
  }

  async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
    try {
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
    } catch (error) {
      this.handleDatabaseError(error, 'updateProduct');
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteProduct');
    }
  }

  // Invoice operations
  async getInvoices(): Promise<schema.Invoice[]> {
    try {
      return await db.select().from(schema.invoices);
    } catch (error) {
      this.handleDatabaseError(error, 'getInvoices');
    }
  }

  async getInvoice(id: number): Promise<schema.Invoice | undefined> {
    try {
      const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
      return invoice;
    } catch (error) {
      this.handleDatabaseError(error, 'getInvoice');
    }
  }

  async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
    try {
      const invoiceWithStringNumbers = {
        ...invoice,
        subtotal: invoice.subtotal.toString(),
        discount: invoice.discount.toString(),
        discountAmount: invoice.discountAmount.toString(),
        finalTotal: invoice.finalTotal.toString(),
      };
      const [newInvoice] = await db.insert(schema.invoices).values([invoiceWithStringNumbers]).returning();
      return newInvoice;
    } catch (error) {
      this.handleDatabaseError(error, 'createInvoice');
    }
  }

  // Store Settings operations
  async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
    try {
      const [settings] = await db.select().from(schema.storeSettings);
      return settings;
    } catch (error) {
      this.handleDatabaseError(error, 'getStoreSettings');
    }
  }

  async updateStoreSettings(settings: {
    storeName: string;
    storeLogo?: string;
  }): Promise<schema.StoreSetting> {
    try {
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
    } catch (error) {
      this.handleDatabaseError(error, 'updateStoreSettings');
    }
  }

  // Supplier operations
  async getSuppliers(): Promise<schema.Supplier[]> {
    try {
      return await db.select().from(schema.suppliers);
    } catch (error) {
      this.handleDatabaseError(error, 'getSuppliers');
    }
  }
  async getSupplier(id: number): Promise<schema.Supplier | undefined> {
    try {
      const [supplier] = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id));
      return supplier;
    } catch (error) {
      this.handleDatabaseError(error, 'getSupplier');
    }
  }
  async createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier> {
    try {
      const [newSupplier] = await db.insert(schema.suppliers).values(supplier).returning();
      return newSupplier;
    } catch (error) {
      this.handleDatabaseError(error, 'createSupplier');
    }
  }
  async updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier> {
    try {
      const [updatedSupplier] = await db
        .update(schema.suppliers)
        .set(supplier)
        .where(eq(schema.suppliers.id, id))
        .returning();
      return updatedSupplier;
    } catch (error) {
      this.handleDatabaseError(error, 'updateSupplier');
    }
  }
  async deleteSupplier(id: number): Promise<void> {
    try {
      await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteSupplier');
    }
  }

  // Purchase operations
  async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
    try {
      return await db.select().from(schema.purchaseOrders);
    } catch (error) {
      this.handleDatabaseError(error, 'getPurchaseOrders');
    }
  }
  async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
    try {
      const [purchaseOrder] = await db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
      return purchaseOrder;
    } catch (error) {
      this.handleDatabaseError(error, 'getPurchaseOrder');
    }
  }
  async createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
    try {
      const purchaseWithStringNumbers = {
        ...purchase,
        totalAmount: purchase.totalAmount.toString(),
        paid: purchase.paid.toString(),
        remaining: purchase.remaining.toString(),
      };
      const [newPurchaseOrder] = await db.insert(schema.purchaseOrders).values([purchaseWithStringNumbers]).returning();
      return newPurchaseOrder;
    } catch (error) {
      this.handleDatabaseError(error, 'createPurchaseOrder');
    }
  }
  async updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder> {
    try {
      const updatesWithStringNumbers = {
        ...updates,
        ...(updates.totalAmount && { totalAmount: updates.totalAmount.toString() }),
        ...(updates.paid && { paid: updates.paid.toString() }),
        ...(updates.remaining && { remaining: updates.remaining.toString() }),
      };
      const [updatedPurchaseOrder] = await db
        .update(schema.purchaseOrders)
        .set({ ...updatesWithStringNumbers })
        .where(eq(schema.purchaseOrders.id, id))
        .returning();
      return updatedPurchaseOrder;
    } catch (error) {
      this.handleDatabaseError(error, 'updatePurchaseOrder');
    }
  }
  async deletePurchaseOrder(id: number): Promise<void> {
    try {
      await db.delete(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deletePurchaseOrder');
    }
  }
  async getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]> {
    try {
      return await db.select().from(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));
    } catch (error) {
      this.handleDatabaseError(error, 'getPurchaseItems');
    }
  }

  // Expense Category operations
  async getExpenseCategories(): Promise<schema.ExpenseCategory[]> {
    try {
      return await db.select().from(schema.expenseCategories);
    } catch (error) {
      this.handleDatabaseError(error, 'getExpenseCategories');
    }
  }
  async getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined> {
    try {
      const [expenseCategory] = await db.select().from(schema.expenseCategories).where(eq(schema.expenseCategories.id, id));
      return expenseCategory;
    } catch (error) {
      this.handleDatabaseError(error, 'getExpenseCategory');
    }
  }
  async createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory> {
    try {
      const [newExpenseCategory] = await db.insert(schema.expenseCategories).values(category).returning();
      return newExpenseCategory;
    } catch (error) {
      this.handleDatabaseError(error, 'createExpenseCategory');
    }
  }
  async updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory> {
    try {
      const [updatedExpenseCategory] = await db
        .update(schema.expenseCategories)
        .set(category)
        .where(eq(schema.expenseCategories.id, id))
        .returning();
      return updatedExpenseCategory;
    } catch (error) {
      this.handleDatabaseError(error, 'updateExpenseCategory');
    }
  }
  async deleteExpenseCategory(id: number): Promise<void> {
    try {
      await db.delete(schema.expenseCategories).where(eq(schema.expenseCategories.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteExpenseCategory');
    }
  }

  // Expense operations
  async getExpenses(): Promise<schema.Expense[]> {
    try {
      return await db.select().from(schema.expenses);
    } catch (error) {
      this.handleDatabaseError(error, 'getExpenses');
    }
  }
  async getExpense(id: number): Promise<schema.Expense | undefined> {
    try {
      const [expense] = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id));
      return expense;
    } catch (error) {
      this.handleDatabaseError(error, 'getExpense');
    }
  }
  async createExpense(expense: schema.InsertExpense): Promise<schema.Expense> {
    try {
      const expenseWithStringNumbers = {
        ...expense,
        amount: expense.amount.toString(),
      };
      const [newExpense] = await db.insert(schema.expenses).values([expenseWithStringNumbers]).returning();
      return newExpense;
    } catch (error) {
      this.handleDatabaseError(error, 'createExpense');
    }
  }
  async updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense> {
    try {
      const updatesWithStringNumbers = {
        ...updates,
        ...(updates.amount && { amount: updates.amount.toString() }),
      };
      const [updatedExpense] = await db
        .update(schema.expenses)
        .set({ ...updatesWithStringNumbers })
        .where(eq(schema.expenses.id, id))
        .returning();
      return updatedExpense;
    } catch (error) {
      this.handleDatabaseError(error, 'updateExpense');
    }
  }
  async deleteExpense(id: number): Promise<void> {
    try {
      await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteExpense');
    }
  }

  // Database connection operations
  async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
    try {
      return await db.select().from(schema.databaseConnections);
    } catch (error) {
      this.handleDatabaseError(error, 'getDatabaseConnections');
    }
  }

  async getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined> {
    try {
      const [connection] = await db.select().from(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
      return connection;
    } catch (error) {
      this.handleDatabaseError(error, 'getDatabaseConnection');
    }
  }

  async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
    try {
      const [newConnection] = await db.insert(schema.databaseConnections).values(connection).returning();
      return newConnection;
    } catch (error) {
      this.handleDatabaseError(error, 'createDatabaseConnection');
    }
  }

  async updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
    try {
      const [updatedConnection] = await db
        .update(schema.databaseConnections)
        .set({ ...connection, updatedAt: new Date() })
        .where(eq(schema.databaseConnections.id, id))
        .returning();
      return updatedConnection;
    } catch (error) {
      this.handleDatabaseError(error, 'updateDatabaseConnection');
    }
  }

  async deleteDatabaseConnection(id: number): Promise<void> {
    try {
      await db.delete(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
    } catch (error) {
      this.handleDatabaseError(error, 'deleteDatabaseConnection');
    }
  }

  async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
    // TODO: Implement actual connection testing logic based on the database type
    return true;
  }

  // Campaign Notification operations
  async getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]> {
    try {
      return await db
        .select()
        .from(schema.campaignNotifications)
        .where(eq(schema.campaignNotifications.campaignId, campaignId));
    } catch (error) {
      this.handleDatabaseError(error, 'getCampaignNotifications');
    }
  }

  async createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification> {
    try {
      const [newNotification] = await db
        .insert(schema.campaignNotifications)
        .values(notification)
        .returning();
      return newNotification;
    } catch (error) {
      this.handleDatabaseError(error, 'createCampaignNotification');
    }
  }

  async updateCampaignNotification(
    id: number,
    notification: Partial<schema.InsertCampaignNotification>
  ): Promise<schema.CampaignNotification> {
    try {
      const [updatedNotification] = await db
        .update(schema.campaignNotifications)
        .set(notification)
        .where(eq(schema.campaignNotifications.id, id))
        .returning();
      return updatedNotification;
    } catch (error) {
      this.handleDatabaseError(error, 'updateCampaignNotification');
    }
  }

  async getPendingNotifications(): Promise<schema.CampaignNotification[]> {
    try {
      return await db
        .select()
        .from(schema.campaignNotifications)
        .where(eq(schema.campaignNotifications.status, 'pending'))
        .orderBy(schema.campaignNotifications.scheduledFor);
    } catch (error) {
      this.handleDatabaseError(error, 'getPendingNotifications');
    }
  }

  // Scheduled Post operations
  async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
    try {
      return await db
        .select()
        .from(schema.scheduledPosts)
        .where(eq(schema.scheduledPosts.campaignId, campaignId));
    } catch (error) {
      this.handleDatabaseError(error, 'getScheduledPosts');
    }
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    try {
      const [newPost] = await db
        .insert(schema.scheduledPosts)
        .values(post)
        .returning();
      return newPost;
    } catch (error) {
      this.handleDatabaseError(error, 'createScheduledPost');
    }
  }

  async updateScheduledPost(
    id: number,
    post: Partial<schema.InsertScheduledPost>
  ): Promise<schema.ScheduledPost> {
    try {
      const [updatedPost] = await db
        .update(schema.scheduledPosts)
        .set(post)
        .where(eq(schema.scheduledPosts.id, id))
        .returning();
      return updatedPost;
    } catch (error) {
      this.handleDatabaseError(error, 'updateScheduledPost');
    }
  }

  async getPendingScheduledPosts(): Promise<schema.ScheduledPost[]> {
    try {
      return await db
        .select()
        .from(schema.scheduledPosts)
        .where(eq(schema.scheduledPosts.status, 'pending'))
        .orderBy(schema.scheduledPosts.scheduledTime);
    } catch (error) {
      this.handleDatabaseError(error, 'getPendingScheduledPosts');
    }
  }
}

export const storage = new DatabaseStorage();