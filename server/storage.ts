import NodeCache from "node-cache";
import pino from "pino";
import type { Invoice, InsertInvoice } from "@shared/schema";

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// Create memory cache
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120
});

export class MemStorage {
  constructor() {
    logger.info('Storage initialized');
  }

  async clearAllData(): Promise<void> {
    try {
      cache.flushAll();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Error clearing data:', error);
      throw error;
    }
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    try {
      return cache.get('invoices') || [];
    } catch (error) {
      logger.error('Error getting invoices from cache:', error);
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