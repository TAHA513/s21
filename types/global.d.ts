declare module 'connect-pg-simple';
declare module '@neondatabase/serverless';

interface IStorage {
  // User operations
  getUser(id: number): Promise<import('@shared/schema').User | undefined>;
  getUserByUsername(username: string): Promise<import('@shared/schema').User | undefined>;
  createUser(user: import('@shared/schema').InsertUser): Promise<import('@shared/schema').User>;

  // Customer operations
  getCustomers(): Promise<import('@shared/schema').Customer[]>;
  getCustomer(id: number): Promise<import('@shared/schema').Customer | undefined>;
  createCustomer(customer: import('@shared/schema').InsertCustomer): Promise<import('@shared/schema').Customer>;

  // Appointment operations
  getAppointments(): Promise<import('@shared/schema').Appointment[]>;
  getAppointment(id: number): Promise<import('@shared/schema').Appointment | undefined>;
  createAppointment(appointment: import('@shared/schema').InsertAppointment): Promise<import('@shared/schema').Appointment>;

  // Product operations
  getProducts(): Promise<import('@shared/schema').Product[]>;
  getProduct(id: number): Promise<import('@shared/schema').Product | undefined>;
  createProduct(product: import('@shared/schema').InsertProduct): Promise<import('@shared/schema').Product>;

  // Product Group operations
  getProductGroups(): Promise<import('@shared/schema').ProductGroup[]>;
  getProductGroup(id: number): Promise<import('@shared/schema').ProductGroup | undefined>;
  createProductGroup(group: import('@shared/schema').InsertProductGroup): Promise<import('@shared/schema').ProductGroup>;

  // Invoice operations
  getInvoices(): Promise<import('@shared/schema').Invoice[]>;
  getInvoice(id: number): Promise<import('@shared/schema').Invoice | undefined>;
  createInvoice(invoice: import('@shared/schema').InsertInvoice): Promise<import('@shared/schema').Invoice>;

  // Marketing Campaign operations
  getMarketingCampaigns(): Promise<import('@shared/schema').MarketingCampaign[]>;
  getMarketingCampaign(id: number): Promise<import('@shared/schema').MarketingCampaign | undefined>;
  createMarketingCampaign(campaign: import('@shared/schema').InsertMarketingCampaign): Promise<import('@shared/schema').MarketingCampaign>;

  // Scheduled Post operations
  getScheduledPosts(campaignId: number): Promise<import('@shared/schema').ScheduledPost[]>;
  createScheduledPost(post: import('@shared/schema').InsertScheduledPost): Promise<import('@shared/schema').ScheduledPost>;

  sessionStore: import('express-session').Store;
}

declare global {
  interface Window {
    ENV: {
      DATABASE_URL: string;
    }
  }
}

export {};