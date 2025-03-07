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

  // Installment Plan operations
  getInstallmentPlans(): Promise<import('@shared/schema').InstallmentPlan[]>;
  getInstallmentPlan(id: number): Promise<import('@shared/schema').InstallmentPlan | undefined>;
  createInstallmentPlan(plan: import('@shared/schema').InsertInstallmentPlan): Promise<import('@shared/schema').InstallmentPlan>;

  // Installment Payment operations
  getInstallmentPayments(planId: number): Promise<import('@shared/schema').InstallmentPayment[]>;
  createInstallmentPayment(payment: import('@shared/schema').InsertInstallmentPayment): Promise<import('@shared/schema').InstallmentPayment>;

  // Marketing Campaign operations
  getMarketingCampaigns(): Promise<import('@shared/schema').MarketingCampaign[]>;
  getMarketingCampaign(id: number): Promise<import('@shared/schema').MarketingCampaign | undefined>;
  createMarketingCampaign(campaign: import('@shared/schema').InsertMarketingCampaign): Promise<import('@shared/schema').MarketingCampaign>;

  // Scheduled Post operations
  getScheduledPosts(campaignId: number): Promise<import('@shared/schema').ScheduledPost[]>;
  createScheduledPost(post: import('@shared/schema').InsertScheduledPost): Promise<import('@shared/schema').ScheduledPost>;

  // Discount Code operations
  getDiscountCodes(): Promise<import('@shared/schema').DiscountCode[]>;
  getDiscountCode(id: number): Promise<import('@shared/schema').DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<import('@shared/schema').DiscountCode | undefined>;
  createDiscountCode(code: import('@shared/schema').InsertDiscountCode): Promise<import('@shared/schema').DiscountCode>;

  // Purchase Order operations
  getPurchaseOrders(): Promise<import('@shared/schema').PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<import('@shared/schema').PurchaseOrder | undefined>;
  createPurchaseOrder(order: import('@shared/schema').InsertPurchaseOrder): Promise<import('@shared/schema').PurchaseOrder>;

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