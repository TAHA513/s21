import memorystore from "memorystore";
import session from "express-session";
import NodeCache from "node-cache";
import pino from "pino";
import { Pool } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

const convertToString = (value: number | string): string => value.toString();
const convertToNumber = (value: string | number): number => typeof value === 'string' ? parseFloat(value) : value;

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120
});

// Create MemoryStore using the factory function
const MemoryStore = memorystore(session);

interface IStorage {
    sessionStore: session.Store;
    getUser(id: number): Promise<schema.User | undefined>;
    getUserByUsername(username: string): Promise<schema.User | undefined>;
    getUserByEmail?(email: string): Promise<schema.User | undefined>; 
    createUser(user: schema.InsertUser): Promise<schema.User>;
    getCustomers(): Promise<schema.Customer[]>;
    getCustomer(id: number): Promise<schema.Customer | undefined>;
    createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer>;
    updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer>;
    deleteCustomer(id: number): Promise<void>;
    getAppointments(): Promise<schema.Appointment[]>;
    getAppointment(id: number): Promise<schema.Appointment | undefined>;
    createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment>;
    updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment>;
    deleteAppointment(id: number): Promise<void>;
    getStaff(): Promise<schema.Staff[]>;
    getStaffMember(id: number): Promise<schema.Staff | undefined>;
    createStaff(staff: schema.InsertStaff): Promise<schema.Staff>;
    updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff>;
    deleteStaff(id: number): Promise<void>;
    getSetting(key: string): Promise<schema.Setting | undefined>;
    getSettings(): Promise<schema.Setting[]>;
    setSetting(key: string, value: string): Promise<schema.Setting>;
    getCampaigns(): Promise<schema.MarketingCampaign[]>;
    getCampaign(id: number): Promise<schema.MarketingCampaign | undefined>;
    createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign>;
    updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign>;
    deleteCampaign(id: number): Promise<void>;
    getPromotions(): Promise<schema.Promotion[]>;
    getPromotion(id: number): Promise<schema.Promotion | undefined>;
    createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion>;
    updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion>;
    deletePromotion(id: number): Promise<void>;
    getDiscountCodes(): Promise<schema.DiscountCode[]>;
    getDiscountCode(id: number): Promise<schema.DiscountCode | undefined>;
    getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined>;
    createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode>;
    updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode>;
    deleteDiscountCode(id: number): Promise<void>;
    getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]>;
    getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined>;
    createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount>;
    updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount>;
    deleteSocialMediaAccount(id: number): Promise<void>;
    getProductGroups(): Promise<schema.ProductGroup[]>;
    getProductGroup(id: number): Promise<schema.ProductGroup | undefined>;
    createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup>;
    updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup>;
    deleteProductGroup(id: number): Promise<void>;
    getProducts(): Promise<schema.Product[]>;
    getProduct(id: number): Promise<schema.Product | undefined>;
    getProductByBarcode(barcode: string): Promise<schema.Product | undefined>;
    createProduct(product: schema.InsertProduct): Promise<schema.Product>;
    updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product>;
    deleteProduct(id: number): Promise<void>;
    getInvoices(): Promise<schema.Invoice[]>;
    getInvoice(id: number): Promise<schema.Invoice | undefined>;
    createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice>;
    getStoreSettings(): Promise<schema.StoreSetting | undefined>;
    updateStoreSettings(settings: { storeName: string; storeLogo?: string; }): Promise<schema.StoreSetting>;
    getSuppliers(): Promise<schema.Supplier[]>;
    getSupplier(id: number): Promise<schema.Supplier | undefined>;
    createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier>;
    updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier>;
    deleteSupplier(id: number): Promise<void>;
    getPurchaseOrders(): Promise<schema.PurchaseOrder[]>;
    getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined>;
    createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder>;
    updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder>;
    deletePurchaseOrder(id: number): Promise<void>;
    getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]>;
    getExpenseCategories(): Promise<schema.ExpenseCategory[]>;
    getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined>;
    createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory>;
    updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory>;
    deleteExpenseCategory(id: number): Promise<void>;
    getExpenses(): Promise<schema.Expense[]>;
    getExpense(id: number): Promise<schema.Expense | undefined>;
    createExpense(expense: schema.InsertExpense): Promise<schema.Expense>;
    updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense>;
    deleteExpense(id: number): Promise<void>;
    getDatabaseConnections(): Promise<schema.DatabaseConnection[]>;
    getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined>;
    createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection>;
    updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection>;
    deleteDatabaseConnection(id: number): Promise<void>;
    testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean>;
    getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]>;
    createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification>;
    updateCampaignNotification(id: number, notification: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification>;
    getPendingNotifications(): Promise<schema.CampaignNotification[]>;
    getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]>;
    createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost>;
    updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost>;
    getPendingScheduledPosts(): Promise<schema.ScheduledPost[]>;
    getDatabaseMetrics():Promise<any>;
    clearCache():Promise<void>;

}

export class MemStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const users = this.getStoredUsers();
    return users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const users = this.getStoredUsers();
    return users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const users = this.getStoredUsers();
    return users.find(u => u.email === email);
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const users = this.getStoredUsers();
    const newUser = {
      ...user,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  // Private helper methods for local storage simulation
  private getStoredUsers(): schema.User[] {
    try {
      const storedUsers = cache.get('users');
      return storedUsers || [];
    } catch (error) {
      logger.error('Error getting users from cache:', error);
      return [];
    }
  }

  private saveUsers(users: schema.User[]): void {
    try {
      cache.set('users', users);
    } catch (error) {
      logger.error('Error saving users to cache:', error);
    }
  }

    async getCustomers(): Promise<schema.Customer[]> {
        try {
            const customers = cache.get<schema.Customer[]>('customers:all') || [];
            return customers;
        } catch (error) {
            logger.error('Error getting customers from cache:', error);
            return [];
        }
    }

    async getCustomer(id: number): Promise<schema.Customer | undefined> {
        try {
            const customers = cache.get<schema.Customer[]>('customers:all') || [];
            return customers.find(c => c.id === id);
        } catch (error) {
            logger.error('Error getting customer from cache:', error);
            return undefined;
        }
    }

    async createCustomer(customer: schema.InsertCustomer): Promise<schema.Customer> {
        try {
            const customers = cache.get<schema.Customer[]>('customers:all') || [];
            const newCustomer = { ...customer, id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1 };
            customers.push(newCustomer);
            cache.set('customers:all', customers);
            return newCustomer;
        } catch (error) {
            logger.error('Error creating customer:', error);
            throw error;
        }
    }


    async updateCustomer(id: number, customer: Partial<schema.InsertCustomer>): Promise<schema.Customer> {
        try {
            const customers = cache.get<schema.Customer[]>('customers:all') || [];
            const index = customers.findIndex(c => c.id === id);
            if (index === -1) {
                throw new Error('Customer not found');
            }
            const updatedCustomer = { ...customers[index], ...customer };
            customers[index] = updatedCustomer;
            cache.set('customers:all', customers);
            return updatedCustomer;
        } catch (error) {
            logger.error('Error updating customer:', error);
            throw error;
        }
    }

    async deleteCustomer(id: number): Promise<void> {
        try {
            const customers = cache.get<schema.Customer[]>('customers:all') || [];
            const index = customers.findIndex(c => c.id === id);
            if (index === -1) {
                return;
            }
            customers.splice(index, 1);
            cache.set('customers:all', customers);
        } catch (error) {
            logger.error('Error deleting customer:', error);
        }
    }

// ... Add the rest of the methods from DatabaseStorage here, adapting them to use cache.  This is a repetitive process, but necessary for completeness.  Each method will need to be adapted similarly to the Customer methods shown above.  Remember to handle potential errors and logging appropriately.

    async getAppointments(): Promise<schema.Appointment[]> {
        try {
            const appointments = cache.get<schema.Appointment[]>('appointments:all') || [];
            return appointments;
        } catch (error) {
            logger.error('Error getting appointments from cache:', error);
            return [];
        }
    }

    async getAppointment(id: number): Promise<schema.Appointment | undefined> {
        try {
            const appointments = cache.get<schema.Appointment[]>('appointments:all') || [];
            return appointments.find(a => a.id === id);
        } catch (error) {
            logger.error('Error getting appointment from cache:', error);
            return undefined;
        }
    }

    async createAppointment(appointment: schema.InsertAppointment): Promise<schema.Appointment> {
        try {
            const appointments = cache.get<schema.Appointment[]>('appointments:all') || [];
            const newAppointment = { ...appointment, id: appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1 };
            appointments.push(newAppointment);
            cache.set('appointments:all', appointments);
            return newAppointment;
        } catch (error) {
            logger.error('Error creating appointment:', error);
            throw error;
        }
    }

    async updateAppointment(id: number, updates: Partial<schema.InsertAppointment>): Promise<schema.Appointment> {
        try {
            const appointments = cache.get<schema.Appointment[]>('appointments:all') || [];
            const index = appointments.findIndex(a => a.id === id);
            if (index === -1) {
                throw new Error('Appointment not found');
            }
            const updatedAppointment = { ...appointments[index], ...updates };
            appointments[index] = updatedAppointment;
            cache.set('appointments:all', appointments);
            return updatedAppointment;
        } catch (error) {
            logger.error('Error updating appointment:', error);
            throw error;
        }
    }

    async deleteAppointment(id: number): Promise<void> {
        try {
            const appointments = cache.get<schema.Appointment[]>('appointments:all') || [];
            const index = appointments.findIndex(a => a.id === id);
            if (index === -1) {
                return;
            }
            appointments.splice(index, 1);
            cache.set('appointments:all', appointments);
        } catch (error) {
            logger.error('Error deleting appointment:', error);
        }
    }


    async getStaff(): Promise<schema.Staff[]> {
        try {
            const staff = cache.get<schema.Staff[]>('staff:all') || [];
            return staff;
        } catch (error) {
            logger.error('Error getting staff from cache:', error);
            return [];
        }
    }

    async getStaffMember(id: number): Promise<schema.Staff | undefined> {
        try {
            const staff = cache.get<schema.Staff[]>('staff:all') || [];
            return staff.find(s => s.id === id);
        } catch (error) {
            logger.error('Error getting staff member from cache:', error);
            return undefined;
        }
    }

    async createStaff(staff: schema.InsertStaff): Promise<schema.Staff> {
        try {
            const staffMembers = cache.get<schema.Staff[]>('staff:all') || [];
            const newStaff = { ...staff, id: staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) + 1 : 1 };
            staffMembers.push(newStaff);
            cache.set('staff:all', staffMembers);
            return newStaff;
        } catch (error) {
            logger.error('Error creating staff member:', error);
            throw error;
        }
    }

    async updateStaff(id: number, updates: Partial<schema.InsertStaff>): Promise<schema.Staff> {
        try {
            const staffMembers = cache.get<schema.Staff[]>('staff:all') || [];
            const index = staffMembers.findIndex(s => s.id === id);
            if (index === -1) {
                throw new Error('Staff member not found');
            }
            const updatedStaff = { ...staffMembers[index], ...updates };
            staffMembers[index] = updatedStaff;
            cache.set('staff:all', staffMembers);
            return updatedStaff;
        } catch (error) {
            logger.error('Error updating staff member:', error);
            throw error;
        }
    }

    async deleteStaff(id: number): Promise<void> {
        try {
            const staffMembers = cache.get<schema.Staff[]>('staff:all') || [];
            const index = staffMembers.findIndex(s => s.id === id);
            if (index === -1) {
                return;
            }
            staffMembers.splice(index, 1);
            cache.set('staff:all', staffMembers);
        } catch (error) {
            logger.error('Error deleting staff member:', error);
        }
    }

    async getSetting(key: string): Promise<schema.Setting | undefined> {
        try {
            const settings = cache.get<schema.Setting[]>('settings:all') || [];
            return settings.find(s => s.key === key);
        } catch (error) {
            logger.error('Error getting setting from cache:', error);
            return undefined;
        }
    }

    async getSettings(): Promise<schema.Setting[]> {
        try {
            const settings = cache.get<schema.Setting[]>('settings:all') || [];
            return settings;
        } catch (error) {
            logger.error('Error getting settings from cache:', error);
            return [];
        }
    }

    async setSetting(key: string, value: string): Promise<schema.Setting> {
        try {
            const settings = cache.get<schema.Setting[]>('settings:all') || [];
            const existingSettingIndex = settings.findIndex(s => s.key === key);
            if (existingSettingIndex !== -1) {
                const updatedSetting = { ...settings[existingSettingIndex], value, updatedAt: new Date() };
                settings[existingSettingIndex] = updatedSetting;
            } else {
                const newSetting = { key, value, createdAt: new Date(), updatedAt: new Date() };
                settings.push(newSetting);
            }
            cache.set('settings:all', settings);
            return settings.find(s => s.key === key)!;
        } catch (error) {
            logger.error('Error setting setting:', error);
            throw error;
        }
    }

    async getCampaigns(): Promise<schema.MarketingCampaign[]> {
        try {
            const campaigns = cache.get<schema.MarketingCampaign[]>('campaigns:all') || [];
            return campaigns;
        } catch (error) {
            logger.error('Error getting campaigns from cache:', error);
            return [];
        }
    }

    async getCampaign(id: number): Promise<schema.MarketingCampaign | undefined> {
        try {
            const campaigns = cache.get<schema.MarketingCampaign[]>('campaigns:all') || [];
            return campaigns.find(c => c.id === id);
        } catch (error) {
            logger.error('Error getting campaign from cache:', error);
            return undefined;
        }
    }

    async createCampaign(campaign: schema.InsertMarketingCampaign): Promise<schema.MarketingCampaign> {
        try {
            const campaigns = cache.get<schema.MarketingCampaign[]>('campaigns:all') || [];
            const newCampaign = { ...campaign, id: campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1 };
            campaigns.push(newCampaign);
            cache.set('campaigns:all', campaigns);
            return newCampaign;
        } catch (error) {
            logger.error('Error creating campaign:', error);
            throw error;
        }
    }

    async updateCampaign(id: number, updates: Partial<schema.InsertMarketingCampaign>): Promise<schema.MarketingCampaign> {
        try {
            const campaigns = cache.get<schema.MarketingCampaign[]>('campaigns:all') || [];
            const index = campaigns.findIndex(c => c.id === id);
            if (index === -1) {
                throw new Error('Campaign not found');
            }
            const updatedCampaign = { ...campaigns[index], ...updates };
            campaigns[index] = updatedCampaign;
            cache.set('campaigns:all', campaigns);
            return updatedCampaign;
        } catch (error) {
            logger.error('Error updating campaign:', error);
            throw error;
        }
    }

    async deleteCampaign(id: number): Promise<void> {
        try {
            const campaigns = cache.get<schema.MarketingCampaign[]>('campaigns:all') || [];
            const index = campaigns.findIndex(c => c.id === id);
            if (index === -1) {
                return;
            }
            campaigns.splice(index, 1);
            cache.set('campaigns:all', campaigns);
        } catch (error) {
            logger.error('Error deleting campaign:', error);
        }
    }

    async getPromotions(): Promise<schema.Promotion[]> {
        try {
            const promotions = cache.get<schema.Promotion[]>('promotions:all') || [];
            return promotions;
        } catch (error) {
            logger.error('Error getting promotions from cache:', error);
            return [];
        }
    }

    async getPromotion(id: number): Promise<schema.Promotion | undefined> {
        try {
            const promotions = cache.get<schema.Promotion[]>('promotions:all') || [];
            return promotions.find(p => p.id === id);
        } catch (error) {
            logger.error('Error getting promotion from cache:', error);
            return undefined;
        }
    }

    async createPromotion(promotion: schema.InsertPromotion): Promise<schema.Promotion> {
        try {
            const promotions = cache.get<schema.Promotion[]>('promotions:all') || [];
            const newPromotion = { ...promotion, id: promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1 };
            promotions.push(newPromotion);
            cache.set('promotions:all', promotions);
            return newPromotion;
        } catch (error) {
            logger.error('Error creating promotion:', error);
            throw error;
        }
    }

    async updatePromotion(id: number, updates: Partial<schema.InsertPromotion>): Promise<schema.Promotion> {
        try {
            const promotions = cache.get<schema.Promotion[]>('promotions:all') || [];
            const index = promotions.findIndex(p => p.id === id);
            if (index === -1) {
                throw new Error('Promotion not found');
            }
            const updatedPromotion = { ...promotions[index], ...updates };
            promotions[index] = updatedPromotion;
            cache.set('promotions:all', promotions);
            return updatedPromotion;
        } catch (error) {
            logger.error('Error updating promotion:', error);
            throw error;
        }
    }

    async deletePromotion(id: number): Promise<void> {
        try {
            const promotions = cache.get<schema.Promotion[]>('promotions:all') || [];
            const index = promotions.findIndex(p => p.id === id);
            if (index === -1) {
                return;
            }
            promotions.splice(index, 1);
            cache.set('promotions:all', promotions);
        } catch (error) {
            logger.error('Error deleting promotion:', error);
        }
    }

    async getDiscountCodes(): Promise<schema.DiscountCode[]> {
        try {
            const discountCodes = cache.get<schema.DiscountCode[]>('discountCodes:all') || [];
            return discountCodes;
        } catch (error) {
            logger.error('Error getting discount codes from cache:', error);
            return [];
        }
    }

    async getDiscountCode(id: number): Promise<schema.DiscountCode | undefined> {
        try {
            const discountCodes = cache.get<schema.DiscountCode[]>('discountCodes:all') || [];
            return discountCodes.find(d => d.id === id);
        } catch (error) {
            logger.error('Error getting discount code from cache:', error);
            return undefined;
        }
    }

    async getDiscountCodeByCode(code: string): Promise<schema.DiscountCode | undefined> {
        try {
            const discountCodes = cache.get<schema.DiscountCode[]>('discountCodes:all') || [];
            return discountCodes.find(d => d.code === code);
        } catch (error) {
            logger.error('Error getting discount code by code from cache:', error);
            return undefined;
        }
    }

    async createDiscountCode(code: schema.InsertDiscountCode): Promise<schema.DiscountCode> {
        try {
            const discountCodes = cache.get<schema.DiscountCode[]>('discountCodes:all') || [];
            const newDiscountCode = { ...code, id: discountCodes.length > 0 ? Math.max(...discountCodes.map(d => d.id)) + 1 : 1 };
            discountCodes.push(newDiscountCode);
            cache.set('discountCodes:all', discountCodes);
            return newDiscountCode;
        } catch (error) {
            logger.error('Error creating discount code:', error);
            throw error;
        }
    }

    async updateDiscountCode(id: number, updates: Partial<schema.InsertDiscountCode>): Promise<schema.DiscountCode> {
        try {
            const discountCodes = cache.get<schema.DiscountCode[]>('discountCodes:all') || [];
            const index = discountCodes.findIndex(d => d.id === id);
            if (index === -1) {
                throw new Error('Discount code not found');
            }
            const updatedDiscountCode = { ...discountCodes[index], ...updates };
            discountCodes[index] = updatedDiscountCode;
            cache.set('discountCodes:all', discountCodes);
            return updatedDiscountCode;
        } catch (error) {
            logger.error('Error updating discount code:', error);
            throw error;
        }
    }

    async deleteDiscountCode(id: number): Promise<void> {
        try {
            const discountCodes = cache.get<schema.DiscountCode[]>('discountCodes:all') || [];
            const index = discountCodes.findIndex(d => d.id === id);
            if (index === -1) {
                return;
            }
            discountCodes.splice(index, 1);
            cache.set('discountCodes:all', discountCodes);
        } catch (error) {
            logger.error('Error deleting discount code:', error);
        }
    }

    async getSocialMediaAccounts(): Promise<schema.SocialMediaAccount[]> {
        try {
            const socialMediaAccounts = cache.get<schema.SocialMediaAccount[]>('socialMediaAccounts:all') || [];
            return socialMediaAccounts;
        } catch (error) {
            logger.error('Error getting social media accounts from cache:', error);
            return [];
        }
    }

    async getSocialMediaAccount(id: number): Promise<schema.SocialMediaAccount | undefined> {
        try {
            const socialMediaAccounts = cache.get<schema.SocialMediaAccount[]>('socialMediaAccounts:all') || [];
            return socialMediaAccounts.find(s => s.id === id);
        } catch (error) {
            logger.error('Error getting social media account from cache:', error);
            return undefined;
        }
    }

    async createSocialMediaAccount(account: schema.InsertSocialMediaAccount): Promise<schema.SocialMediaAccount> {
        try {
            const socialMediaAccounts = cache.get<schema.SocialMediaAccount[]>('socialMediaAccounts:all') || [];
            const newAccount = { ...account, id: socialMediaAccounts.length > 0 ? Math.max(...socialMediaAccounts.map(s => s.id)) + 1 : 1 };
            socialMediaAccounts.push(newAccount);
            cache.set('socialMediaAccounts:all', socialMediaAccounts);
            return newAccount;
        } catch (error) {
            logger.error('Error creating social media account:', error);
            throw error;
        }
    }

    async updateSocialMediaAccount(id: number, updates: Partial<schema.InsertSocialMediaAccount>): Promise<schema.SocialMediaAccount> {
        try {
            const socialMediaAccounts = cache.get<schema.SocialMediaAccount[]>('socialMediaAccounts:all') || [];
            const index = socialMediaAccounts.findIndex(s => s.id === id);
            if (index === -1) {
                throw new Error('Social media account not found');
            }
            const updatedAccount = { ...socialMediaAccounts[index], ...updates };
            socialMediaAccounts[index] = updatedAccount;
            cache.set('socialMediaAccounts:all', socialMediaAccounts);
            return updatedAccount;
        } catch (error) {
            logger.error('Error updating social media account:', error);
            throw error;
        }
    }

    async deleteSocialMediaAccount(id: number): Promise<void> {
        try {
            const socialMediaAccounts = cache.get<schema.SocialMediaAccount[]>('socialMediaAccounts:all') || [];
            const index = socialMediaAccounts.findIndex(s => s.id === id);
            if (index === -1) {
                return;
            }
            socialMediaAccounts.splice(index, 1);
            cache.set('socialMediaAccounts:all', socialMediaAccounts);
        } catch (error) {
            logger.error('Error deleting social media account:', error);
        }
    }

    async getProductGroups(): Promise<schema.ProductGroup[]> {
        try {
            const productGroups = cache.get<schema.ProductGroup[]>('productGroups:all') || [];
            return productGroups;
        } catch (error) {
            logger.error('Error getting product groups from cache:', error);
            return [];
        }
    }

    async getProductGroup(id: number): Promise<schema.ProductGroup | undefined> {
        try {
            const productGroups = cache.get<schema.ProductGroup[]>('productGroups:all') || [];
            return productGroups.find(pg => pg.id === id);
        } catch (error) {
            logger.error('Error getting product group from cache:', error);
            return undefined;
        }
    }

    async createProductGroup(group: schema.InsertProductGroup): Promise<schema.ProductGroup> {
        try {
            const productGroups = cache.get<schema.ProductGroup[]>('productGroups:all') || [];
            const newGroup = { ...group, id: productGroups.length > 0 ? Math.max(...productGroups.map(pg => pg.id)) + 1 : 1 };
            productGroups.push(newGroup);
            cache.set('productGroups:all', productGroups);
            return newGroup;
        } catch (error) {
            logger.error('Error creating product group:', error);
            throw error;
        }
    }

    async updateProductGroup(id: number, updates: Partial<schema.InsertProductGroup>): Promise<schema.ProductGroup> {
        try {
            const productGroups = cache.get<schema.ProductGroup[]>('productGroups:all') || [];
            const index = productGroups.findIndex(pg => pg.id === id);
            if (index === -1) {
                throw new Error('Product group not found');
            }
            const updatedGroup = { ...productGroups[index], ...updates };
            productGroups[index] = updatedGroup;
            cache.set('productGroups:all', productGroups);
            return updatedGroup;
        } catch (error) {
            logger.error('Error updating product group:', error);
            throw error;
        }
    }

    async deleteProductGroup(id: number): Promise<void> {
        try {
            const productGroups = cache.get<schema.ProductGroup[]>('productGroups:all') || [];
            const index = productGroups.findIndex(pg => pg.id === id);
            if (index === -1) {
                return;
            }
            productGroups.splice(index, 1);
            cache.set('productGroups:all', productGroups);
        } catch (error) {
            logger.error('Error deleting product group:', error);
        }
    }

    async getProducts(): Promise<schema.Product[]> {
        try {
            const products = cache.get<schema.Product[]>('products:all') || [];
            return products;
        } catch (error) {
            logger.error('Error getting products from cache:', error);
            return [];
        }
    }

    async getProduct(id: number): Promise<schema.Product | undefined> {
        try {
            const products = cache.get<schema.Product[]>('products:all') || [];
            return products.find(p => p.id === id);
        } catch (error) {
            logger.error('Errorgetting product from cache:', error);
            return undefined;
        }
    }

    async getProductByBarcode(barcode: string): Promise<schema.Product | undefined> {
        try {
            const products = cache.get<schema.Product[]>('products:all') || [];
            return products.find(p => p.barcode === barcode);
        } catch (error) {
            logger.error('Error getting product by barcode from cache:', error);
            return undefined;
        }
    }

    async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
        try {
            const products = cache.get<schema.Product[]>('products:all') || [];
            const newProduct = { ...product, id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1 };
            products.push(newProduct);
            cache.set('products:all', products);
            return newProduct;
        } catch (error) {
            logger.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id: number, updates: Partial<schema.InsertProduct>): Promise<schema.Product> {
        try {
            const products = cache.get<schema.Product[]>('products:all') || [];
            const index = products.findIndex(p => p.id === id);
            if (index === -1) {
                throw new Error('Product not found');
            }
            const updatedProduct = { ...products[index], ...updates };
            products[index] = updatedProduct;
            cache.set('products:all', products);
            return updatedProduct;
        } catch (error) {
            logger.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id: number): Promise<void> {
        try {
            const products = cache.get<schema.Product[]>('products:all') || [];
            const index = products.findIndex(p => p.id === id);
            if (index === -1) {
                return;
            }
            products.splice(index, 1);
            cache.set('products:all', products);
        } catch (error) {
            logger.error('Error deleting product:', error);
        }
    }

    async getInvoices(): Promise<schema.Invoice[]> {
        try {
            const invoices = cache.get<schema.Invoice[]>('invoices:all') || [];
            return invoices;
        } catch (error) {
            logger.error('Error getting invoices from cache:', error);
            return [];
        }
    }

    async getInvoice(id: number): Promise<schema.Invoice | undefined> {
        try {
            const invoices = cache.get<schema.Invoice[]>('invoices:all') || [];
            return invoices.find(i => i.id === id);
        } catch (error) {
            logger.error('Error getting invoice from cache:', error);
            return undefined;
        }
    }

    async createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice> {
        try {
            const invoices = cache.get<schema.Invoice[]>('invoices:all') || [];
            const newInvoice = { ...invoice, id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1, subtotal: convertToString(invoice.subtotal), discount: convertToString(invoice.discount), discountAmount: convertToString(invoice.discountAmount), finalTotal: convertToString(invoice.finalTotal) };
            invoices.push(newInvoice);
            cache.set('invoices:all', invoices);
            return { ...newInvoice, subtotal: convertToNumber(newInvoice.subtotal), discount: convertToNumber(newInvoice.discount), discountAmount: convertToNumber(newInvoice.discountAmount), finalTotal: convertToNumber(newInvoice.finalTotal) };
        } catch (error) {
            logger.error('Error creating invoice:', error);
            throw error;
        }
    }

    async getStoreSettings(): Promise<schema.StoreSetting | undefined> {
        try {
            const storeSettings = cache.get<schema.StoreSetting>('storeSettings');
            return storeSettings;
        } catch (error) {
            logger.error('Error getting store settings from cache:', error);
            return undefined;
        }
    }

    async updateStoreSettings(settings: { storeName: string; storeLogo?: string; }): Promise<schema.StoreSetting> {
        try {
            const updatedSettings = { ...settings, id: 1, updatedAt: new Date() };
            cache.set('storeSettings', updatedSettings);
            return updatedSettings;
        } catch (error) {
            logger.error('Error updating store settings:', error);
            throw error;
        }
    }

    async getSuppliers(): Promise<schema.Supplier[]> {
        try {
            const suppliers = cache.get<schema.Supplier[]>('suppliers:all') || [];
            return suppliers;
        } catch (error) {
            logger.error('Error getting suppliers from cache:', error);
            return [];
        }
    }

    async getSupplier(id: number): Promise<schema.Supplier | undefined> {
        try {
            const suppliers = cache.get<schema.Supplier[]>('suppliers:all') || [];
            return suppliers.find(s => s.id === id);
        } catch (error) {
            logger.error('Error getting supplier from cache:', error);
            return undefined;
        }
    }

    async createSupplier(supplier: schema.InsertSupplier): Promise<schema.Supplier> {
        try {
            const suppliers = cache.get<schema.Supplier[]>('suppliers:all') || [];
            const newSupplier = { ...supplier, id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1 };
            suppliers.push(newSupplier);
            cache.set('suppliers:all', suppliers);
            return newSupplier;
        } catch (error) {
            logger.error('Error creating supplier:', error);
            throw error;
        }
    }

    async updateSupplier(id: number, supplier: Partial<schema.InsertSupplier>): Promise<schema.Supplier> {
        try {
            const suppliers = cache.get<schema.Supplier[]>('suppliers:all') || [];
            const index = suppliers.findIndex(s => s.id === id);
            if (index === -1) {
                throw new Error('Supplier not found');
            }
            const updatedSupplier = { ...suppliers[index], ...supplier };
            suppliers[index] = updatedSupplier;
            cache.set('suppliers:all', suppliers);
            return updatedSupplier;
        } catch (error) {
            logger.error('Error updating supplier:', error);
            throw error;
        }
    }

    async deleteSupplier(id: number): Promise<void> {
        try {
            const suppliers = cache.get<schema.Supplier[]>('suppliers:all') || [];
            const index = suppliers.findIndex(s => s.id === id);
            if (index === -1) {
                return;
            }
            suppliers.splice(index, 1);
            cache.set('suppliers:all', suppliers);
        } catch (error) {
            logger.error('Error deleting supplier:', error);
        }
    }

    async getPurchaseOrders(): Promise<schema.PurchaseOrder[]> {
        try {
            const purchaseOrders = cache.get<schema.PurchaseOrder[]>('purchaseOrders:all') || [];
            return purchaseOrders;
        } catch (error) {
            logger.error('Error getting purchase orders from cache:', error);
            return [];
        }
    }

    async getPurchaseOrder(id: number): Promise<schema.PurchaseOrder | undefined> {
        try {
            const purchaseOrders = cache.get<schema.PurchaseOrder[]>('purchaseOrders:all') || [];
            return purchaseOrders.find(po => po.id === id);
        } catch (error) {
            logger.error('Error getting purchase order from cache:', error);
            return undefined;
        }
    }

    async createPurchaseOrder(purchase: schema.InsertPurchaseOrder): Promise<schema.PurchaseOrder> {
        try {
            const purchaseOrders = cache.get<schema.PurchaseOrder[]>('purchaseOrders:all') || [];
            const newPurchaseOrder = { ...purchase, id: purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(po => po.id)) + 1 : 1, totalAmount: convertToString(purchase.totalAmount), paid: convertToString(purchase.paid), remaining: convertToString(purchase.remaining) };
            purchaseOrders.push(newPurchaseOrder);
            cache.set('purchaseOrders:all', purchaseOrders);
            return newPurchaseOrder;
        } catch (error) {
            logger.error('Error creating purchase order:', error);
            throw error;
        }
    }

    async updatePurchaseOrder(id: number, updates: Partial<schema.InsertPurchaseOrder>): Promise<schema.PurchaseOrder> {
        try {
            const purchaseOrders = cache.get<schema.PurchaseOrder[]>('purchaseOrders:all') || [];
            const index = purchaseOrders.findIndex(po => po.id === id);
            if (index === -1) {
                throw new Error('Purchase order not found');
            }
            const updatedPurchaseOrder = { ...purchaseOrders[index], ...updates, totalAmount: updates.totalAmount ? convertToString(updates.totalAmount) : purchaseOrders[index].totalAmount, paid: updates.paid ? convertToString(updates.paid) : purchaseOrders[index].paid, remaining: updates.remaining ? convertToString(updates.remaining) : purchaseOrders[index].remaining };
            purchaseOrders[index] = updatedPurchaseOrder;
            cache.set('purchaseOrders:all', purchaseOrders);
            return updatedPurchaseOrder;
        } catch (error) {
            logger.error('Error updating purchase order:', error);
            throw error;
        }
    }

    async deletePurchaseOrder(id: number): Promise<void> {
        try {
            const purchaseOrders = cache.get<schema.PurchaseOrder[]>('purchaseOrders:all') || [];
            const index = purchaseOrders.findIndex(po => po.id === id);
            if (index === -1) {
                return;
            }
            purchaseOrders.splice(index, 1);
            cache.set('purchaseOrders:all', purchaseOrders);
        } catch (error) {
            logger.error('Error deleting purchase order:', error);
        }
    }

    async getPurchaseItems(purchaseId: number): Promise<schema.PurchaseItem[]> {
        try {
            const purchaseItems = cache.get<schema.PurchaseItem[]>(`purchaseItems:${purchaseId}`) || [];
            return purchaseItems;
        } catch (error) {
            logger.error('Error getting purchase items from cache:', error);
            return [];
        }
    }

    async getExpenseCategories(): Promise<schema.ExpenseCategory[]> {
        try {
            const expenseCategories = cache.get<schema.ExpenseCategory[]>('expenseCategories:all') || [];
            return expenseCategories;
        } catch (error) {
            logger.error('Error getting expense categories from cache:', error);
            return [];
        }
    }

    async getExpenseCategory(id: number): Promise<schema.ExpenseCategory | undefined> {
        try {
            const expenseCategories = cache.get<schema.ExpenseCategory[]>('expenseCategories:all') || [];
            return expenseCategories.find(ec => ec.id === id);
        } catch (error) {
            logger.error('Error getting expense category from cache:', error);
            return undefined;
        }
    }

    async createExpenseCategory(category: schema.InsertExpenseCategory): Promise<schema.ExpenseCategory> {
        try {
            const expenseCategories = cache.get<schema.ExpenseCategory[]>('expenseCategories:all') || [];
            const newCategory = { ...category, id: expenseCategories.length > 0 ? Math.max(...expenseCategories.map(ec => ec.id)) + 1 : 1 };
            expenseCategories.push(newCategory);
            cache.set('expenseCategories:all', expenseCategories);
            return newCategory;
        } catch (error) {
            logger.error('Error creating expense category:', error);
            throw error;
        }
    }

    async updateExpenseCategory(id: number, category: Partial<schema.InsertExpenseCategory>): Promise<schema.ExpenseCategory> {
        try {
            const expenseCategories = cache.get<schema.ExpenseCategory[]>('expenseCategories:all') || [];
            const index = expenseCategories.findIndex(ec => ec.id === id);
            if (index === -1) {
                throw new Error('Expense category not found');
            }
            const updatedCategory = { ...expenseCategories[index], ...category };
            expenseCategories[index] = updatedCategory;
            cache.set('expenseCategories:all', expenseCategories);
            return updatedCategory;
        } catch (error) {
            logger.error('Error updating expense category:', error);
            throw error;
        }
    }

    async deleteExpenseCategory(id: number): Promise<void> {
        try {
            const expenseCategories = cache.get<schema.ExpenseCategory[]>('expenseCategories:all') || [];
            const index = expenseCategories.findIndex(ec => ec.id === id);
            if (index === -1) {
                return;
            }
            expenseCategories.splice(index, 1);
            cache.set('expenseCategories:all', expenseCategories);
        } catch (error) {
            logger.error('Error deleting expense category:', error);
        }
    }

    async getExpenses(): Promise<schema.Expense[]> {
        try {
            const expenses = cache.get<schema.Expense[]>('expenses:all') || [];
            return expenses;
        } catch (error) {
            logger.error('Error getting expenses from cache:', error);
            return [];
        }
    }

    async getExpense(id: number): Promise<schema.Expense | undefined> {
        try {
            const expenses = cache.get<schema.Expense[]>('expenses:all') || [];
            return expenses.find(e => e.id === id);
        } catch (error) {
            logger.error('Error getting expense from cache:', error);
            return undefined;
        }
    }

    async createExpense(expense: schema.InsertExpense): Promise<schema.Expense> {
        try {
            const expenses = cache.get<schema.Expense[]>('expenses:all') || [];
            const newExpense = { ...expense, id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1, amount: convertToString(expense.amount) };
            expenses.push(newExpense);
            cache.set('expenses:all', expenses);
            return newExpense;
        } catch (error) {
            logger.error('Error creating expense:', error);
            throw error;
        }
    }

    async updateExpense(id: number, updates: Partial<schema.InsertExpense>): Promise<schema.Expense> {
        try {
            const expenses = cache.get<schema.Expense[]>('expenses:all') || [];
            const index = expenses.findIndex(e => e.id === id);
            if (index === -1) {
                throw new Error('Expense not found');
            }
            const updatedExpense = { ...expenses[index], ...updates, amount: updates.amount ? convertToString(updates.amount) : expenses[index].amount };
            expenses[index] = updatedExpense;
            cache.set('expenses:all', expenses);
            return updatedExpense;
        } catch (error) {
            logger.error('Error updating expense:', error);
            throw error;
        }
    }

    async deleteExpense(id: number): Promise<void> {
        try {
            const expenses = cache.get<schema.Expense[]>('expenses:all') || [];
            const index = expenses.findIndex(e => e.id === id);
            if (index === -1) {
                return;
            }
            expenses.splice(index, 1);
            cache.set('expenses:all', expenses);
        } catch (error) {
            logger.error('Error deleting expense:', error);
        }
    }

    async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
        return []; 
    }

    async getDatabaseConnection(id: number): Promise<schema.DatabaseConnection | undefined> {
        return undefined; 
    }

    async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
        throw new Error("Method not implemented.");
    }

    async updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
        throw new Error("Method not implemented.");
    }

    async deleteDatabaseConnection(id: number): Promise<void> {
        return; 
    }

    async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
        return true; 
    }

    async getCampaignNotifications(campaignId: number): Promise<schema.CampaignNotification[]> {
        return []; 
    }

    async createCampaignNotification(notification: schema.InsertCampaignNotification): Promise<schema.CampaignNotification> {
        throw new Error("Method not implemented.");
    }

    async updateCampaignNotification(id: number, notification: Partial<schema.InsertCampaignNotification>): Promise<schema.CampaignNotification> {
        throw new Error("Method not implemented.");
    }

    async getPendingNotifications(): Promise<schema.CampaignNotification[]> {
        return []; 
    }

    async getScheduledPosts(campaignId: number): Promise<schema.ScheduledPost[]> {
        return []; 
    }

    async createScheduledPost(post: schema.InsertScheduledPost): Promise<schema.ScheduledPost> {
        throw new Error("Method not implemented.");
    }

    async updateScheduledPost(id: number, post: Partial<schema.InsertScheduledPost>): Promise<schema.ScheduledPost> {
        throw new Error("Method not implemented.");
    }

    async getPendingScheduledPosts(): Promise<schema.ScheduledPost[]> {
        return []; 
    }
    async getDatabaseMetrics() {
        return {}; 
    }

    async clearCache() {
        cache.flushAll();
        logger.info('Cache cleared');
    }
}

export const storage = new MemStorage();