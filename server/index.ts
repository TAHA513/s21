import express from 'express';
import session from 'express-session';
import { db } from './db';
import { storage } from './storage';
import { json } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';
import { sql } from 'drizzle-orm';
import { users } from '../shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Add detailed request logging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Middleware
app.use(json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure helmet with relaxed CSP for development
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP in development
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Enable CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Health check endpoint with detailed logging
app.get('/api/health', async (req, res) => {
  try {
    console.log('[Health Check] Testing database connection...');
    const startTime = Date.now();

    // Test database connection
    const [result] = await db.select({ count: sql`1` }).from(users);

    const duration = Date.now() - startTime;
    console.log(`[Health Check] Database query completed successfully in ${duration}ms`);

    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      queryTime: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Health Check] Database connection failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message || 'Database connection failed',
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes with improved error handling
app.get('/api/database-connections', async (req, res) => {
  try {
    console.log('[API] Fetching database connections...');
    const connections = await storage.getDatabaseConnections();
    console.log(`[API] Successfully retrieved ${connections.length} database connections`);
    res.json(connections);
  } catch (error) {
    console.error('[API] Error fetching database connections:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب اتصالات قواعد البيانات',
      details: error.message
    });
  }
});

app.get('/api/social-accounts', async (req, res) => {
  try {
    console.log('[API] Fetching social accounts...');
    const accounts = await storage.getSocialMediaAccounts();
    console.log(`[API] Successfully retrieved ${accounts.length} social accounts`);
    res.json(accounts);
  } catch (error) {
    console.error('[API] Error fetching social accounts:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب حسابات التواصل الاجتماعي',
      details: error.message
    });
  }
});

// Default route for development mode
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      status: 'Development server is running',
      apis: {
        health: '/api/health',
        databaseConnections: '/api/database-connections',
        socialAccounts: '/api/social-accounts'
      },
      frontend: 'http://localhost:5173'
    });
  });
}

// Handle frontend routing in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ALWAYS serve the app on port 5000
const PORT = parseInt(process.env.PORT || '5000');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});