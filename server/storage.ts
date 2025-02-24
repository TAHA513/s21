import memorystore from "memorystore";
import session from "express-session";
import NodeCache from "node-cache";
import pino from "pino";
import { User, InsertUser } from "@shared/schema";

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

  // User operations with proper error handling and logging
  async getUser(id: number): Promise<User | undefined> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.id === id);
      logger.info({ userId: id, found: !!user }, 'Get user request');
      return user;
    } catch (error) {
      logger.error({ userId: id, error }, 'Error getting user');
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.username === username);
      logger.info({ username, found: !!user }, 'Get user by username request');
      return user;
    } catch (error) {
      logger.error({ username, error }, 'Error getting user by username');
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === email);
      logger.info({ email, found: !!user }, 'Get user by email request');
      return user;
    } catch (error) {
      logger.error({ email, error }, 'Error getting user by email');
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
      this.saveUsers(users);
      logger.info({ userId: newUser.id }, 'User created successfully');
      return newUser;
    } catch (error) {
      logger.error({ userData, error }, 'Error creating user');
      throw error;
    }
  }

  private getStoredUsers(): User[] {
    try {
      return cache.get('users') || [];
    } catch (error) {
      logger.error('Error getting users from cache:', error);
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    try {
      cache.set('users', users);
      logger.info('Users saved to cache');
    } catch (error) {
      logger.error('Error saving users to cache:', error);
      throw error;
    }
  }
}

// Create and export a single instance
export const storage = new MemStorage();