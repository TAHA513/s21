import memorystore from "memorystore";
import session from "express-session";
import NodeCache from "node-cache";
import pino from "pino";
import type { User, InsertUser, Invoice, InsertInvoice } from "@shared/schema";

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// Create memory cache for user data
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120
});

// Create MemoryStore for sessions
const MemoryStore = memorystore(session);

export class MemStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    logger.info('Storage initialized');
  }

  async clearAllData(): Promise<void> {
    try {
      // Clear cache
      cache.flushAll();
      logger.info('Cache cleared');

      // Clear session store
      if (this.sessionStore instanceof MemoryStore) {
        this.sessionStore.clear();
        logger.info('Session store cleared');
      }
    } catch (error) {
      logger.error('Error clearing data:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.id === id);
      logger.info('Getting user by ID:', { id, found: !!user });
      return user;
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.username === username);
      logger.info('Getting user by username:', { username, found: !!user });
      return user;
    } catch (error) {
      logger.error('Error getting user by username:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const users = this.getStoredUsers();
      const newUser: User = {
        ...userData,
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        role: 'staff',
        createdAt: new Date(),
      };
      users.push(newUser);
      cache.set('users', users);
      logger.info('User created:', { userId: newUser.id, username: newUser.username });
      return newUser;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  private getStoredUsers(): User[] {
    const users = cache.get('users');
    logger.info('Getting stored users:', { count: users ? users.length : 0 });
    return users || [];
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    try {
      return cache.get('invoices') || [];
    } catch (error) {
      logger.error('Error getting invoices:', error);
      return [];
    }
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    try {
      const invoices = await this.getInvoices();
      const newInvoice: Invoice = {
        ...data,
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        createdAt: new Date(),
      };
      invoices.push(newInvoice);
      cache.set('invoices', invoices);
      return newInvoice;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }
}

// Create and export a single instance
export const storage = new MemStorage();