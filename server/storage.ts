
import { eq } from 'drizzle-orm';
import { db, pool } from './db';
import * as schema from '../shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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

  // Product operations
  getProducts(): Promise<schema.Product[]>;
  getProduct(id: number): Promise<schema.Product | undefined>;
  createProduct(product: schema.InsertProduct): Promise<schema.Product>;
  updateProduct(id: number, product: Partial<schema.InsertProduct>): Promise<schema.Product>;
  deleteProduct(id: number): Promise<void>;

  // Invoice operations
  getInvoices(): Promise<schema.Invoice[]>;
  getInvoice(id: number): Promise<schema.Invoice | undefined>;
  createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice>;

  // اتصال قواعد البيانات
  getDatabaseConnections(): Promise<schema.DatabaseConnection[]>;
  createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection>;
  updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection>;
  deleteDatabaseConnection(id: number): Promise<void>;
  testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean>;

  sessionStore: session.Store;
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

  // Product operations
  async getProducts(): Promise<schema.Product[]> {
    return await db.select().from(schema.products);
  }

  async getProduct(id: number): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
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

  // Database connection operations
  async getDatabaseConnections(): Promise<schema.DatabaseConnection[]> {
    return await db.select().from(schema.databaseConnections);
  }

  async createDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<schema.DatabaseConnection> {
    const [newConnection] = await db.insert(schema.databaseConnections).values(connection).returning();
    return newConnection;
  }

  async updateDatabaseConnection(id: number, connection: Partial<schema.InsertDatabaseConnection>): Promise<schema.DatabaseConnection> {
    const [updatedConnection] = await db
      .update(schema.databaseConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(schema.databaseConnections.id, id))
      .returning();
    return updatedConnection;
  }

  async deleteDatabaseConnection(id: number): Promise<void> {
    await db.delete(schema.databaseConnections).where(eq(schema.databaseConnections.id, id));
  }

  async testDatabaseConnection(connection: schema.InsertDatabaseConnection): Promise<boolean> {
    try {
      const testPool = new Pool({ 
        connectionString: connection.connectionString 
      });
      await testPool.query('SELECT NOW()');
      await testPool.end();
      return true;
    } catch (error) {
      console.error('فشل اختبار الاتصال بقاعدة البيانات:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
