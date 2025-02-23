import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import pino from 'pino';

// Create a logger instance
export const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  logger.error("DATABASE_URL environment variable is not set");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Add error handling for the pool
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Monitor pool events
pool.on('connect', client => {
  logger.info('New client connected to the pool');
});

pool.on('remove', client => {
  logger.info('Client removed from pool');
});

// Create the drizzle db instance with query logging
export const db = drizzle({ 
  client: pool, 
  schema,
  logger: true
});

// Export a function to check database connection
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    logger.info('Successfully connected to database');
    client.release();
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
}