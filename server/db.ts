import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool with settings optimized for serverless
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1, // Limit connections for serverless environment
  connectionTimeoutMillis: 5000, // 5 second timeout
  idleTimeoutMillis: 120000 // Close idle connections after 120 seconds
});

export const db = drizzle({ client: pool, schema });

// Ensure connections are released properly
process.on('SIGTERM', () => {
  pool.end();
});