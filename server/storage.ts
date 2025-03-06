import { db } from './db';
import { eq } from 'drizzle-orm';
import {
  users,
  databaseConnections,
  storeSettings,
  socialMediaAccounts,
  backupConfigs,
  type User,
  type InsertUser,
  type DatabaseConnection,
  type InsertDatabaseConnection,
  type StoreSettings,
  type InsertStoreSettings,
  type SocialMediaAccount,
  type InsertSocialMediaAccount,
  type BackupConfig,
  type InsertBackupConfig,
} from '../shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Database connection operations
  getDatabaseConnections(): Promise<DatabaseConnection[]>;
  getDatabaseConnection(id: number): Promise<DatabaseConnection | undefined>;
  createDatabaseConnection(connection: InsertDatabaseConnection): Promise<DatabaseConnection>;
  updateDatabaseConnection(id: number, connection: Partial<InsertDatabaseConnection>): Promise<DatabaseConnection>;
  deleteDatabaseConnection(id: number): Promise<void>;

  // Store settings operations
  getStoreSettings(): Promise<StoreSettings | undefined>;
  updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings>;

  // Social media account operations
  getSocialMediaAccounts(): Promise<SocialMediaAccount[]>;
  createSocialMediaAccount(account: InsertSocialMediaAccount): Promise<SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;

  // Backup operations
  getBackupConfigs(): Promise<BackupConfig[]>;
  createBackupConfig(config: InsertBackupConfig): Promise<BackupConfig>;
  updateBackupConfig(id: number, config: Partial<InsertBackupConfig>): Promise<BackupConfig>;
  deleteBackupConfig(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Database connection operations
  async getDatabaseConnections(): Promise<DatabaseConnection[]> {
    return await db.select().from(databaseConnections);
  }

  async getDatabaseConnection(id: number): Promise<DatabaseConnection | undefined> {
    const [connection] = await db
      .select()
      .from(databaseConnections)
      .where(eq(databaseConnections.id, id));
    return connection;
  }

  async createDatabaseConnection(connection: InsertDatabaseConnection): Promise<DatabaseConnection> {
    const [newConnection] = await db
      .insert(databaseConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async updateDatabaseConnection(
    id: number,
    connection: Partial<InsertDatabaseConnection>
  ): Promise<DatabaseConnection> {
    const [updatedConnection] = await db
      .update(databaseConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(databaseConnections.id, id))
      .returning();
    return updatedConnection;
  }

  async deleteDatabaseConnection(id: number): Promise<void> {
    await db.delete(databaseConnections).where(eq(databaseConnections.id, id));
  }

  // Store settings operations
  async getStoreSettings(): Promise<StoreSettings | undefined> {
    const [settings] = await db.select().from(storeSettings);
    return settings;
  }

  async updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings> {
    const [existingSettings] = await db.select().from(storeSettings);
    if (existingSettings) {
      const [updatedSettings] = await db
        .update(storeSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(storeSettings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db
        .insert(storeSettings)
        .values({ ...settings })
        .returning();
      return newSettings;
    }
  }

  // Social media account operations
  async getSocialMediaAccounts(): Promise<SocialMediaAccount[]> {
    return await db.select().from(socialMediaAccounts);
  }

  async createSocialMediaAccount(account: InsertSocialMediaAccount): Promise<SocialMediaAccount> {
    const [newAccount] = await db
      .insert(socialMediaAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    await db.delete(socialMediaAccounts).where(eq(socialMediaAccounts.id, id));
  }

  // Backup operations
  async getBackupConfigs(): Promise<BackupConfig[]> {
    return await db.select().from(backupConfigs);
  }

  async createBackupConfig(config: InsertBackupConfig): Promise<BackupConfig> {
    const [newConfig] = await db
      .insert(backupConfigs)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateBackupConfig(
    id: number,
    config: Partial<InsertBackupConfig>
  ): Promise<BackupConfig> {
    const [updatedConfig] = await db
      .update(backupConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(backupConfigs.id, id))
      .returning();
    return updatedConfig;
  }

  async deleteBackupConfig(id: number): Promise<void> {
    await db.delete(backupConfigs).where(eq(backupConfigs.id, id));
  }
}

// Export a single instance of DatabaseStorage
export const storage = new DatabaseStorage();
