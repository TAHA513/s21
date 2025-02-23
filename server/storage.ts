import { Pool } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";
import NodeCache from "node-cache";
import pino from "pino";

const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// إعداد نظام التسجيل
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// إعداد الذاكرة المؤقتة
const cache = new NodeCache({
  stdTTL: 600, // 10 دقائق
  checkperiod: 120 // فحص كل دقيقتين
});

// نظام مراقبة أداء قاعدة البيانات
const dbMetrics = {
  queryCount: 0,
  slowQueries: [] as { query: string; duration: number }[],
  lastReset: Date.now()
};

// دالة لتسجيل وقت تنفيذ الاستعلام
async function measureQueryTime<T>(operation: () => Promise<T>, queryName: string): Promise<T> {
  const start = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - start;

    // تسجيل الاستعلامات البطيئة (أكثر من 100ms)
    if (duration > 100) {
      dbMetrics.slowQueries.push({ query: queryName, duration });
      logger.warn({ query: queryName, duration }, 'Slow query detected');
    }

    dbMetrics.queryCount++;
    return result;
  } catch (error) {
    logger.error({ error, query: queryName }, 'Database query error');
    throw error;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

    // إعادة تعيين المقاييس كل ساعة
    setInterval(() => {
      dbMetrics.queryCount = 0;
      dbMetrics.slowQueries = [];
      dbMetrics.lastReset = Date.now();
    }, 3600000);
  }

  // User operations with caching and logging
  async getUser(id: number): Promise<schema.User | undefined> {
    const cacheKey = `user:${id}`;
    const cachedUser = cache.get<schema.User>(cacheKey);

    if (cachedUser) {
      logger.debug({ userId: id }, 'User retrieved from cache');
      return cachedUser;
    }

    return await measureQueryTime(async () => {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      if (user) {
        cache.set(cacheKey, user);
      }
      return user;
    }, 'getUser');
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return await measureQueryTime(async () => {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
      return user;
    }, 'getUserByUsername');
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    return await measureQueryTime(async () => {
      const [newUser] = await db.insert(schema.users).values(user).returning();
      return newUser;
    }, 'createUser');
  }

  // Customer operations with caching and logging
  async getCustomers(): Promise<schema.Customer[]> {
    const cacheKey = 'customers:all';
    const cachedCustomers = cache.get<schema.Customer[]>(cacheKey);
    if (cachedCustomers) {
      logger.debug('Customers retrieved from cache');
      return cachedCustomers;
    }
    return await measureQueryTime(async () => {
      const customers = await db.select().from(schema.customers);
      cache.set(cacheKey, customers);
      return customers;
    }, 'getCustomers');
  }

  async getCustomer(id: number): Promise<schema.Customer | undefined> {
    const cacheKey = `customer:${id}`;
    const cachedCustomer = cache.get<schema.Customer>(cacheKey);
    if (cachedCustomer) {
      logger.debug({ customerId: id }, 'Customer retrieved from cache');
      return cachedCustomer;
    }
    return await measureQueryTime(async () => {
      const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
      if (customer) {
        cache.set(cacheKey, customer);
      }
      return customer;
    }, 'getCustomer');
  }

  async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
    return await measureQueryTime(async () => {
      const [newCustomer] = await db.insert(schema.customers).values(customer).returning();
      return newCustomer;
    }, 'createCustomer');
  }

  async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
    return await measureQueryTime(async () => {
      const [updatedCustomer] = await db
        .update(schema.customers)
        .set(customer)
        .where(eq(schema.customers.id, id))
        .returning();
      cache.del(`customer:${id}`);
      cache.del('customers:all');
      return updatedCustomer;
    }, 'updateCustomer');
  }

  async deleteCustomer(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.customers).where(eq(schema.customers.id, id));
      cache.del(`customer:${id}`);
      cache.del('customers:all');
    }, 'deleteCustomer');
  }


  // Appointment operations with caching and logging
  async getAppointments(): Promise<schema.Appointment[]> {
    const cacheKey = 'appointments:all';
    const cachedAppointments = cache.get<schema.Appointment[]>(cacheKey);
    if (cachedAppointments) {
      logger.debug('Appointments retrieved from cache');
      return cachedAppointments;
    }
    return await measureQueryTime(async () => {
      const appointments = await db.select().from(schema.appointments);
      cache.set(cacheKey, appointments);
      return appointments;
    }, 'getAppointments');
  }

  async getAppointment(id: number): Promise<schema.Appointment | undefined> {
    const cacheKey = `appointment:${id}`;
    const cachedAppointment = cache.get<schema.Appointment>(cacheKey);
    if (cachedAppointment) {
      logger.debug({ appointmentId: id }, 'Appointment retrieved from cache');
      return cachedAppointment;
    }
    return await measureQueryTime(async () => {
      const [appointment] = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id));
      if (appointment) {
        cache.set(cacheKey, appointment);
      }
      return appointment;
    }, 'getAppointment');
  }

  async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
    return await measureQueryTime(async () => {
      const [newAppointment] = await db.insert(schema.appointments).values(appointment).returning();
      return newAppointment;
    }, 'createAppointment');
  }

  async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
    return await measureQueryTime(async () => {
      const [updatedAppointment] = await db
        .update(schema.appointments)
        .set(updates)
        .where(eq(schema.appointments.id, id))
        .returning();
      cache.del(`appointment:${id}`);
      cache.del('appointments:all');
      return updatedAppointment;
    }, 'updateAppointment');
  }

  async deleteAppointment(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.appointments).where(eq(schema.appointments.id, id));
      cache.del(`appointment:${id}`);
      cache.del('appointments:all');
    }, 'deleteAppointment');
  }

  // Staff operations with caching and logging
  async getStaff(): Promise<schema.Staff[]> {
    const cacheKey = 'staff:all';
    const cachedStaff = cache.get<schema.Staff[]>(cacheKey);
    if (cachedStaff) {
      logger.debug('Staff retrieved from cache');
      return cachedStaff;
    }
    return await measureQueryTime(async () => {
      const staff = await db.select().from(schema.staff);
      cache.set(cacheKey, staff);
      return staff;
    }, 'getStaff');
  }

  async getStaffMember(id: number): Promise<schema.Staff | undefined> {
    const cacheKey = `staff:${id}`;
    const cachedStaff = cache.get<schema.Staff>(cacheKey);
    if (cachedStaff) {
      logger.debug({ staffId: id }, 'Staff member retrieved from cache');
      return cachedStaff;
    }
    return await measureQueryTime(async () => {
      const [staff] = await db.select().from(schema.staff).where(eq(schema.staff.id, id));
      if (staff) {
        cache.set(cacheKey, staff);
      }
      return staff;
    }, 'getStaffMember');
  }

  async createStaff(staff: schema.InsertStaff): Promise<schema.Staff> {
    return await measureQueryTime(async () => {
      const [newStaff] = await db.insert(schema.staff).values(staff).returning();
      return newStaff;
    }, 'createStaff');
  }

  async updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff> {
    return await measureQueryTime(async () => {
      const [updatedStaff] = await db
        .update(schema.staff)
        .set(updates)
        .where(eq(schema.staff.id, id))
        .returning();
      cache.del(`staff:${id}`);
      cache.del('staff:all');
      return updatedStaff;
    }, 'updateStaff');
  }

  async deleteStaff(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.staff).where(eq(schema.staff.id, id));
      cache.del(`staff:${id}`);
      cache.del('staff:all');
    }, 'deleteStaff');
  }

  // Settings operations with caching and logging
  async getSetting(key: string): Promise<schema.Setting | undefined> {
    const cacheKey = `setting:${key}`;
    const cachedSetting = cache.get<schema.Setting>(cacheKey);
    if (cachedSetting) {
      logger.debug({ settingKey: key }, 'Setting retrieved from cache');
      return cachedSetting;
    }
    return await measureQueryTime(async () => {
      const [setting] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
      if (setting) {
        cache.set(cacheKey, setting);
      }
      return setting;
    }, 'getSetting');
  }

  async getSettings(): Promise<schema.Setting[]> {
    const cacheKey = 'settings:all';
    const cachedSettings = cache.get<schema.Setting[]>(cacheKey);
    if (cachedSettings) {
      logger.debug('Settings retrieved from cache');
      return cachedSettings;
    }
    return await measureQueryTime(async () => {
      const settings = await db.select().from(schema.settings);
      cache.set(cacheKey, settings);
      return settings;
    }, 'getSettings');
  }

  async setSetting(key: string, value: string): Promise<schema.Setting> {
    return await measureQueryTime(async () => {
      const [setting] = await db
        .insert(schema.settings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value, updatedAt: new Date() },
        })
        .returning();
      cache.del(`setting:${key}`);
      cache.del('settings:all');
      return setting;
    }, 'setSetting');
  }

  // Marketing Campaign operations with caching and logging
  async getCampaigns(): Promise<schema.MarketingCampaign[]> {
    const cacheKey = 'campaigns:all';
    const cachedCampaigns = cache.get<schema.MarketingCampaign[]>(cacheKey);
    if (cachedCampaigns) {
      logger.debug('Campaigns retrieved from cache');
      return cachedCampaigns;
    }
    return await measureQueryTime(async () => {
      const campaigns = await db.select().from(schema.marketingCampaigns);
      cache.set(cacheKey, campaigns);
      return campaigns;
    }, 'getCampaigns');
  }

  async getCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
    const cacheKey = `campaign:${id}`;
    const cachedCampaign = cache.get<schema.MarketingCampaign>(cacheKey);
    if (cachedCampaign) {
      logger.debug({ campaignId: id }, 'Campaign retrieved from cache');
      return cachedCampaign;
    }
    return await measureQueryTime(async () => {
      const [campaign] = await db.select().from(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
      if (campaign) {
        cache.set(cacheKey, campaign);
      }
      return campaign;
    }, 'getCampaign');
  }

  async createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
    return await measureQueryTime(async () => {
      const [newCampaign] = await db.insert(schema.marketingCampaigns).values(campaign).returning();
      return newCampaign;
    }, 'createCampaign');
  }

  async updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
    return await measureQueryTime(async () => {
      const [updatedCampaign] = await db
        .update(schema.marketingCampaigns)
        .set(updates)
        .where(eq(schema.marketingCampaigns.id, id))
        .returning();
      cache.del(`campaign:${id}`);
      cache.del('campaigns:all');
      return updatedCampaign;
    }, 'updateCampaign');
  }

  async deleteCampaign(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.marketingCampaigns).where(eq(schema.marketingCampaigns.id, id));
      cache.del(`campaign:${id}`);
      cache.del('campaigns:all');
    }, 'deleteCampaign');
  }

  // Promotion operations with caching and logging
  async getPromotions(): Promise<schema.Promotion[]> {
    const cacheKey = 'promotions:all';
    const cachedPromotions = cache.get<schema.Promotion[]>(cacheKey);
    if (cachedPromotions) {
      logger.debug('Promotions retrieved from cache');
      return cachedPromotions;
    }
    return await measureQueryTime(async () => {
      const promotions = await db.select().from(schema.promotions);
      cache.set(cacheKey, promotions);
      return promotions;
    }, 'getPromotions');
  }

  async getPromotion(id: number): Promise<schema.Promotion | undefined> {
    const cacheKey = `promotion:${id}`;
    const cachedPromotion = cache.get<schema.Promotion>(cacheKey);
    if (cachedPromotion) {
      logger.debug({ promotionId: id }, 'Promotion retrieved from cache');
      return cachedPromotion;
    }
    return await measureQueryTime(async () => {
      const [promotion] = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id));
      if (promotion) {
        cache.set(cacheKey, promotion);
      }
      return promotion;
    }, 'getPromotion');
  }

  async createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion> {
    return await measureQueryTime(async () => {
      const [newPromotion] = await db.insert(schema.promotions).values(promotion).returning();
      return newPromotion;
    }, 'createPromotion');
  }

  async updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion> {
    return await measureQueryTime(async () => {
      const [updatedPromotion] = await db
        .update(schema.promotions)
        .set(updates)
        .where(eq(schema.promotions.id, id))
        .returning();
      cache.del(`promotion:${id}`);
      cache.del('promotions:all');
      return updatedPromotion;
    }, 'updatePromotion');
  }

  async deletePromotion(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.promotions).where(eq(schema.promotions.id, id));
      cache.del(`promotion:${id}`);
      cache.del('promotions:all');
    }, 'deletePromotion');
  }

  // Discount Code operations with caching and logging
  async getDiscountCodes(): Promise<schema.DiscountCode[]> {
    const cacheKey = 'discountCodes:all';
    const cachedDiscountCodes = cache.get<schema.DiscountCode[]>(cacheKey);
    if (cachedDiscountCodes) {
      logger.debug('Discount codes retrieved from cache');
      return cachedDiscountCodes;
    }
    return await measureQueryTime(async () => {
      const discountCodes = await db.select().from(schema.discountCodes);
      cache.set(cacheKey, discountCodes);
      return discountCodes;
    }, 'getDiscountCodes');
  }

  async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
    const cacheKey = `discountCode:${id}`;
    const cachedDiscountCode = cache.get<schema.DiscountCode>(cacheKey);
    if (cachedDiscountCode) {
      logger.debug({ discountCodeId: id }, 'Discount code retrieved from cache');
      return cachedDiscountCode;
    }
    return await measureQueryTime(async () => {
      const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.id, id));
      if (discountCode) {
        cache.set(cacheKey, discountCode);
      }
      return discountCode;
    }, 'getDiscountCode');
  }

  async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
    return await measureQueryTime(async () => {
      const [discountCode] = await db.select().from(schema.discountCodes).where(eq(schema.discountCodes.code, code));
      return discountCode;
    }, 'getDiscountCodeByCode');
  }

  async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
    return await measureQueryTime(async () => {
      const [newDiscountCode] = await db.insert(schema.discountCodes).values(code).returning();
      return newDiscountCode;
    }, 'createDiscountCode');
  }

  async updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode> {
    return await measureQueryTime(async () => {
      const [updatedDiscountCode] = await db
        .update(schema.discountCodes)
        .set(updates)
        .where(eq(schema.discountCodes.id, id))
        .returning();
      cache.del(`discountCode:${id}`);
      cache.del('discountCodes:all');
      return updatedDiscountCode;
    }, 'updateDiscountCode');
  }

  async deleteDiscountCode(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.discountCodes).where(eq(schema.discountCodes.id, id));
      cache.del(`discountCode:${id}`);
      cache.del('discountCodes:all');
    }, 'deleteDiscountCode');
  }

  // Social Media Account operations with caching and logging
  async getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]> {
    const cacheKey = 'socialMediaAccounts:all';
    const cachedSocialMediaAccounts = cache.get<schema.SocialMediaAccount[]>(cacheKey);
    if (cachedSocialMediaAccounts) {
      logger.debug('Social media accounts retrieved from cache');
      return cachedSocialMediaAccounts;
    }
    return await measureQueryTime(async () => {
      const socialMediaAccounts = await db.select().from(schema.socialMediaAccounts);
      cache.set(cacheKey, socialMediaAccounts);
      return socialMediaAccounts;
    }, 'getSocialMediaAccounts');
  }

  async getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined> {
    const cacheKey = `socialMediaAccount:${id}`;
    const cachedSocialMediaAccount = cache.get<schema.SocialMediaAccount>(cacheKey);
    if (cachedSocialMediaAccount) {
      logger.debug({ socialMediaAccountId: id }, 'Social media account retrieved from cache');
      return cachedSocialMediaAccount;
    }
    return await measureQueryTime(async () => {
      const [account] = await db.select().from(schema.socialMediaAccounts).where(eq(schema.socialMediaAccounts.id, id));
      if (account) {
        cache.set(cacheKey, account);
      }
      return account;
    }, 'getSocialMediaAccount');
  }

  async createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount> {
    return await measureQueryTime(async () => {
      const [newAccount] = await db.insert(schema.socialMediaAccounts).values(account).returning();
      return newAccount;
    }, 'createSocialMediaAccount');
  }

  async updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount> {
    return await measureQueryTime(async () => {
      const [updatedAccount] = await db
        .update(schema.socialMediaAccounts)
        .set(updates)
        .where(eq(schema.socialMediaAccounts.id, id))
        .returning();
      cache.del(`socialMediaAccount:${id}`);
      cache.del('socialMediaAccounts:all');
      return updatedAccount;
    }, 'updateSocialMediaAccount');
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.socialMediaAccounts).where(eq(schema.socialMediaAccounts.id, id));
      cache.del(`socialMediaAccount:${id}`);
      cache.del('socialMediaAccounts:all');
    }, 'deleteSocialMediaAccount');
  }

  // Product Group operations with caching and logging
  async getProductGroups(): Promise<schema.ProductGroup[]> {
    const cacheKey = 'productGroups:all';
    const cachedProductGroups = cache.get<schema.ProductGroup[]>(cacheKey);
    if (cachedProductGroups) {
      logger.debug('Product groups retrieved from cache');
      return cachedProductGroups;
    }
    return await measureQueryTime(async () => {
      const groups = await db.select().from(schema.productGroups);
      cache.set(cacheKey, groups);
      return groups;
    }, 'getProductGroups');
  }

  async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
    const cacheKey = `productGroup:${id}`;
    const cachedProductGroup = cache.get<schema.ProductGroup>(cacheKey);
    if (cachedProductGroup) {
      logger.debug({ productGroupId: id }, 'Product group retrieved from cache');
      return cachedProductGroup;
    }
    return await measureQueryTime(async () => {
      const [group] = await db.select().from(schema.productGroups).where(eq(schema.productGroups.id, id));
      if (group) {
        cache.set(cacheKey, group);
      }
      return group;
    }, 'getProductGroup');
  }

  async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
    return await measureQueryTime(async () => {
      const [newGroup] = await db.insert(schema.productGroups).values(group).returning();
      cache.del('productGroups:all');
      return newGroup;
    }, 'createProductGroup');
  }

  async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
    return await measureQueryTime(async () => {
      const [updatedGroup] = await db
        .update(schema.productGroups)
        .set(updates)
        .where(eq(schema.productGroups.id, id))
        .returning();
      cache.del(`productGroup:${id}`);
      cache.del('productGroups:all');
      return updatedGroup;
    }, 'updateProductGroup');
  }

  async deleteProductGroup(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.productGroups).where(eq(schema.productGroups.id, id));
      cache.del(`productGroup:${id}`);
      cache.del('productGroups:all');
    }, 'deleteProductGroup');
  }

  // Product operations with improved performance and caching
  async getProducts(): Promise<schema.Product[]> {
    const cacheKey = 'products:all';
    const cachedProducts = cache.get<schema.Product[]>(cacheKey);

    if (cachedProducts) {
      logger.debug('Products retrieved from cache');
      return cachedProducts;
    }

    return await measureQueryTime(async () => {
      try {
        logger.info('Fetching all products with their groups');
        const products = await db
          .select({
            id: schema.products.id,
            name: schema.products.name,
            type: schema.products.type,
            quantity: schema.products.quantity,
            minimumQuantity: schema.products.minimumQuantity,
            costPrice: schema.products.costPrice,
            sellingPrice: schema.products.sellingPrice,
            groupId: schema.products.groupId,
            isWeighted: schema.products.isWeighted,
            status: schema.products.status,
            barcode: schema.products.barcode,
            createdAt: schema.products.createdAt,
            updatedAt: schema.products.updatedAt,
            groupName: schema.productGroups.name,
          })
          .from(schema.products)
          .leftJoin(schema.productGroups, eq(schema.products.groupId, schema.productGroups.id));

        cache.set(cacheKey, products);
        return products;
      } catch (error) {
        logger.error({ error }, 'Error fetching products');
        throw new Error(`Failed to fetch products: ${(error as Error).message}`);
      }
    }, 'getProducts');
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    const cacheKey = `product:${id}`;
    const cachedProduct = cache.get<schema.Product>(cacheKey);
    if (cachedProduct) {
      logger.debug({ productId: id }, 'Product retrieved from cache');
      return cachedProduct;
    }
    return await measureQueryTime(async () => {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
      if (product) {
        cache.set(cacheKey, product);
      }
      return product;
    }, 'getProduct');
  }

  async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
    return await measureQueryTime(async () => {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.barcode, barcode));
      return product;
    }, 'getProductByBarcode');
  }

  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    return await measureQueryTime(async () => {
      const [newProduct] = await db.insert(schema.products).values(product).returning();
      cache.del('products:all');
      return newProduct;
    }, 'createProduct');
  }

  async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
    return await measureQueryTime(async () => {
      const [updatedProduct] = await db
        .update(schema.products)
        .set(updates)
        .where(eq(schema.products.id, id))
        .returning();

      // مسح الذاكرة المؤقتة للمنتجات لضمان تحديث البيانات
      cache.del('products:all');
      cache.del(`product:${id}`);

      logger.info({ productId: id }, 'Product updated and cache cleared');
      return updatedProduct;
    }, 'updateProduct');
  }

  async deleteProduct(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.products).where(eq(schema.products.id, id));
      cache.del(`product:${id}`);
      cache.del('products:all');
    }, 'deleteProduct');
  }

  // Invoice operations with caching and logging
  async getInvoices(): Promise<schema.Invoice[]> {
    const cacheKey = 'invoices:all';
    const cachedInvoices = cache.get<schema.Invoice[]>(cacheKey);
    if (cachedInvoices) {
      logger.debug('Invoices retrieved from cache');
      return cachedInvoices;
    }
    return await measureQueryTime(async () => {
      const invoices = await db.select().from(schema.invoices);
      cache.set(cacheKey, invoices);
      return invoices.map(invoice => ({
        ...invoice,
        subtotal: Number(invoice.subtotal),
        discount: Number(invoice.discount),
        discountAmount: Number(invoice.discountAmount),
        finalTotal: Number(invoice.finalTotal),
      }));
    }, 'getInvoices');
  }

  async getInvoice(id: number): Promise<schema.Invoice | undefined> {
    const cacheKey = `invoice:${id}`;
    const cachedInvoice = cache.get<schema.Invoice>(cacheKey);
    if (cachedInvoice) {
      logger.debug({ invoiceId: id }, 'Invoice retrieved from cache');
      return cachedInvoice;
    }
    return await measureQueryTime(async () => {
      const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
      if (invoice) {
        cache.set(cacheKey, invoice);
      }
      return invoice;
    }, 'getInvoice');
  }

  async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
    return await measureQueryTime(async () => {
      const invoiceWithStringNumbers = {
        ...invoice,
        subtotal: invoice.subtotal.toString(),
        discount: invoice.discount.toString(),
        discountAmount: invoice.discountAmount.toString(),
        finalTotal: invoice.finalTotal.toString(),
      };

      const [newInvoice] = await db.insert(schema.invoices)
        .values(invoiceWithStringNumbers)
        .returning();

      return {
        ...newInvoice,
        subtotal: Number(newInvoice.subtotal),
        discount: Number(newInvoice.discount),
        discountAmount: Number(newInvoice.discountAmount),
        finalTotal: Number(newInvoice.finalTotal),
      };
    }, 'createInvoice');
  }

  // Store Settings operations with caching and logging
  async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
    const cacheKey = 'storeSettings';
    const cachedStoreSettings = cache.get<schema.StoreSetting>(cacheKey);
    if (cachedStoreSettings) {
      logger.debug('Store settings retrieved from cache');
      return cachedStoreSettings;
    }
    return await measureQueryTime(async () => {
      const [settings] = await db.select().from(schema.storeSettings);
      if (settings) {
        cache.set(cacheKey, settings);
      }
      return settings;
    }, 'getStoreSettings');
  }

  async updateStoreSettings(settings: {
    storeName: string;
    storeLogo?: string;
  }): Promise<schema.StoreSetting> {
    return await measureQueryTime(async () => {
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
      cache.del('storeSettings');
      return updatedSettings;
    }, 'updateStoreSettings');
  }

  // Supplier operations with caching and logging
  async getSuppliers(): Promise<schema.Supplier[]> {
    const cacheKey = 'suppliers:all';
    const cachedSuppliers = cache.get<schema.Supplier[]>(cacheKey);
    if (cachedSuppliers) {
      logger.debug('Suppliers retrieved from cache');
      return cachedSuppliers;
    }
    return await measureQueryTime(async () => {
      const suppliers = await db.select().from(schema.suppliers);
      cache.set(cacheKey, suppliers);
      return suppliers;
    }, 'getSuppliers');
  }

  async getSupplier(id: number): Promise<schema.Supplier | undefined> {
    const cacheKey = `supplier:${id}`;
    const cachedSupplier = cache.get<schema.Supplier>(cacheKey);
    if (cachedSupplier) {
      logger.debug({ supplierId: id }, 'Supplier retrieved from cache');
      return cachedSupplier;
    }
    return await measureQueryTime(async () => {
      const [supplier] = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id));
      if (supplier) {
        cache.set(cacheKey, supplier);
      }
      return supplier;
    }, 'getSupplier');
  }

  async createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier> {
    return await measureQueryTime(async () => {
      const [newSupplier] = await db.insert(schema.suppliers).values(supplier).returning();
      cache.del('suppliers:all');
      return newSupplier;
    }, 'createSupplier');
  }

  async updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier> {
    return await measureQueryTime(async () => {
      const [updatedSupplier] = await db
        .update(schema.suppliers)
        .set(supplier)
        .where(eq(schema.suppliers.id, id))
        .returning();
      cache.del(`supplier:${id}`);
      cache.del('suppliers:all');
      return updatedSupplier;
    }, 'updateSupplier');
  }

  async deleteSupplier(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id));
      cache.del(`supplier:${id}`);
      cache.del('suppliers:all');
    }, 'deleteSupplier');
  }

  // Purchase operations with caching and logging
  async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
    const cacheKey = 'purchaseOrders:all';
    const cachedPurchaseOrders = cache.get<schema.PurchaseOrder[]>(cacheKey);
    if (cachedPurchaseOrders) {
      logger.debug('Purchase orders retrieved from cache');
      return cachedPurchaseOrders;
    }
    return await measureQueryTime(async () => {
      const purchaseOrders = await db.select().from(schema.purchaseOrders);
      cache.set(cacheKey, purchaseOrders);
      return purchaseOrders;
    }, 'getPurchaseOrders');
  }

  async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
    const cacheKey = `purchaseOrder:${id}`;
    const cachedPurchaseOrder = cache.get<schema.PurchaseOrder>(cacheKey);
    if (cachedPurchaseOrder) {
      logger.debug({ purchaseOrderId: id }, 'Purchase order retrieved from cache');
      return cachedPurchaseOrder;
    }
    return await measureQueryTime(async () => {
      const [purchaseOrder] = await db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
      if (purchaseOrder) {
        cache.set(cacheKey, purchaseOrder);
      }
      return purchaseOrder;
    }, 'getPurchaseOrder');
  }

  async createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
    return await measureQueryTime(async () => {
      const purchaseWithStringNumbers = {
        ...purchase,
        totalAmount: purchase.totalAmount.toString(),
        paid: purchase.paid.toString(),
        remaining: purchase.remaining.toString(),
      };
      const [newPurchaseOrder] = await db.insert(schema.purchaseOrders).values([purchaseWithStringNumbers]).returning();
      cache.del('purchaseOrders:all');
      return newPurchaseOrder;
    }, 'createPurchaseOrder');
  }

  async updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder> {
    return await measureQueryTime(async () => {
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
      cache.del(`purchaseOrder:${id}`);
      cache.del('purchaseOrders:all');
      return updatedPurchaseOrder;
    }, 'updatePurchaseOrder');
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id));
      cache.del(`purchaseOrder:${id}`);
      cache.del('purchaseOrders:all');
    }, 'deletePurchaseOrder');
  }

  async getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]> {
    return await measureQueryTime(async () => {
      return await db.select().from(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));
    }, 'getPurchaseItems');
  }

  // Expense Category operations with caching and logging
  async getExpenseCategories(): Promise<schema.ExpenseCategory[]> {
    const cacheKey = 'expenseCategories:all';
    const cachedExpenseCategories = cache.get<schema.ExpenseCategory[]>(cacheKey);
    if (cachedExpenseCategories) {
      logger.debug('Expense categories retrieved from cache');
      return cachedExpenseCategories;
    }
    return await measureQueryTime(async () => {
      const expenseCategories = await db.select().from(schema.expenseCategories);
      cache.set(cacheKey, expenseCategories);
      return expenseCategories;
    }, 'getExpenseCategories');
  }

  async getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined> {
    const cacheKey = `expenseCategory:${id}`;
    const cachedExpenseCategory = cache.get<schema.ExpenseCategory>(cacheKey);
    if (cachedExpenseCategory) {
      logger.debug({ expenseCategoryId: id }, 'Expense category retrieved from cache');
      return cachedExpenseCategory;
    }
    return await measureQueryTime(async () => {
      const [expenseCategory] = await db.select().from(schema.expenseCategories).where(eq(schema.expenseCategories.id, id));
      if (expenseCategory) {
        cache.set(cacheKey, expenseCategory);
      }
      return expenseCategory;
    }, 'getExpenseCategory');
  }

  async createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory> {
    return await measureQueryTime(async () => {
      const [newExpenseCategory] = await db.insert(schema.expenseCategories).values(category).returning();
      cache.del('expenseCategories:all');
      return newExpenseCategory;
    }, 'createExpenseCategory');
  }

  async updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory> {
    return await measureQueryTime(async () => {
      const [updatedExpenseCategory] = await db
        .update(schema.expenseCategories)
        .set(category)
        .where(eq(schema.expenseCategories.id, id))
        .returning();
      cache.del(`expenseCategory:${id}`);
      cache.del('expenseCategories:all');
      return updatedExpenseCategory;
    }, 'updateExpenseCategory');
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.expenseCategories).where(eq(schema.expenseCategories.id, id));
      cache.del(`expenseCategory:${id}`);
      cache.del('expenseCategories:all');
    }, 'deleteExpenseCategory');
  }

  // Expense operations with caching and logging
  async getExpenses(): Promise<schema.Expense[]> {
    const cacheKey = 'expenses:all';
    const cachedExpenses = cache.get<schema.Expense[]>(cacheKey);
    if (cachedExpenses) {
      logger.debug('Expenses retrieved from cache');
      return cachedExpenses;
    }
    return await measureQueryTime(async () => {
      const expenses = await db.select().from(schema.expenses);
      cache.set(cacheKey, expenses);
      return expenses;
    }, 'getExpenses');
  }

  async getExpense(id: number): Promise<schema.Expense | undefined> {
    const cacheKey = `expense:${id}`;
    const cachedExpense = cache.get<schema.Expense>(cacheKey);
    if (cachedExpense) {
      logger.debug({ expenseId: id }, 'Expense retrieved from cache');
      return cachedExpense;
    }
    return await measureQueryTime(async () => {
      const [expense] = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id));
      if (expense) {
        cache.set(cacheKey, expense);
      }
      return expense;
    }, 'getExpense');
  }

  async createExpense(expense: schema.InsertExpense): Promise<schema.Expense> {
    return await measureQueryTime(async () => {
      const expenseWithStringNumbers = {
        ...expense,
        amount: expense.amount.toString(),
      };
      const [newExpense] = await db.insert(schema.expenses).values([expenseWithStringNumbers]).returning();
      cache.del('expenses:all');
      return newExpense;
    }, 'createExpense');
  }

  async updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense> {
    return await measureQueryTime(async () => {
      const updatesWithStringNumbers = {
        ...updates,
        ...(updates.amount && { amount: updates.amount.toString() }),
      };
      const [updatedExpense] = await db
        .update(schema.expenses)
        .set({ ...updatesWithStringNumbers })
        .where(eq(schema.expenses.id, id))
        .returning();
      cache.del(`expense:${id}`);
      cache.del('expenses:all');
      return updatedExpense;
    }, 'updateExpense');
  }

  async deleteExpense(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
      cache.del(`expense:${id}`);
      cache.del('expenses:all');
    }, 'deleteExpense');
  }

  // Database connection operations with logging
  async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
    return await measureQueryTime(async () => {
      return await db.select().from(schema.databaseConnections);
    }, 'getDatabaseConnections');
  }

  async getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined> {
    return await measureQueryTime(async () => {
      const [connection] = await db.select().from(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
      return connection;
    }, 'getDatabaseConnection');
  }

  async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
    return await measureQueryTime(async () => {
      const [newConnection] = await db.insert(schema.databaseConnections).values(connection).returning();
      return newConnection;
    }, 'createDatabaseConnection');
  }

  async updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
    return await measureQueryTime(async () => {
      const [updatedConnection] = await db
        .update(schema.databaseConnections)
        .set({ ...connection, updatedAt: new Date() })
        .where(eq(schema.databaseConnections.id, id))
        .returning();
      return updatedConnection;
    }, 'updateDatabaseConnection');
  }

  async deleteDatabaseConnection(id: number): Promise<void> {
    return await measureQueryTime(async () => {
      await db.delete(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
    }, 'deleteDatabaseConnection');
  }

  async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
    // TODO:Implement actual connection testing logic based on the database type
    return true;
  }

  // Campaign Notification operations with logging
  async getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]> {
    return await measureQueryTime(async () => {
      return await db
        .select()
        .from(schema.campaignNotifications)
        .where(eq(schema.campaignNotifications.campaignId, campaignId));
    }, 'getCampaignNotifications');
  }

  async createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification> {
    return await measureQueryTime(async () => {
      const [newNotification] = await db
        .insert(schema.campaignNotifications)
        .values(notification)
        .returning();
      return newNotification;
    }, 'createCampaignNotification');
  }

  async updateCampaignNotification(
    id: number,
    notification: Partial<schema.InsertCampaignNotification>
  ): Promise<schema.CampaignNotification> {
    return await measureQueryTime(async () => {
      const [updatedNotification] = await db
        .update(schema.campaignNotifications)
        .set(notification)
        .where(eq(schema.campaignNotifications.id, id))
        .returning();
      return updatedNotification;
    }, 'updateCampaignNotification');
  }

  async getPendingNotifications(): Promise<schema.CampaignNotification[]> {
    return await measureQueryTime(async () => {
      return await db
        .select()
        .from(schema.campaignNotifications)
        .where(eq(schema.campaignNotifications.status, 'pending'))
        .orderBy(schema.campaignNotifications.scheduledFor);
    }, 'getPendingNotifications');
  }

  // Scheduled Post operations with logging
  async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
    return await measureQueryTime(async () => {
      return await db
        .select()
        .from(schema.scheduledPosts)
        .where(eq(schema.scheduledPosts.campaignId, campaignId));
    }, 'getScheduledPosts');
  }

  async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
    return await measureQueryTime(async () => {
      const [newPost] = await db
        .insert(schema.scheduledPosts)
        .values(post)
        .returning();
      return newPost;
    }, 'createScheduledPost');
  }

  async updateScheduledPost(
    id: number,
    post: Partial<schema.InsertScheduledPost>
  ): Promise<schema.ScheduledPost> {
    return await measureQueryTime(async () => {
      const [updatedPost] = await db
        .update(schema.scheduledPosts)
        .set(post)
        .where(eq(schema.scheduledPosts.id, id))
        .returning();
      return updatedPost;
    }, 'updateScheduledPost');
  }

  async getPendingScheduledPosts(): Promise<schema.ScheduledPost[]> {
    return await measureQueryTime(async () => {
      return await db
        .select()
        .from(schema.scheduledPosts)
        .where(eq(schema.scheduledPosts.status, 'pending'))
        .orderBy(schema.scheduledPosts.scheduledTime);
    }, 'getPendingScheduledPosts');
  }

  // دالة للحصول على إحصائيات قاعدة البيانات
  async getDatabaseMetrics() {
    return {
      ...dbMetrics,
      uptime: Date.now() - dbMetrics.lastReset,
      cacheStats: cache.getStats(),
    };
  }

  // دالة لمسح الذاكرة المؤقتة
  async clearCache() {
    cache.flushAll();
    logger.info('Cache cleared');
  }
}

export const storage = new DatabaseStorage();