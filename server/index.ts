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

// Middleware
app.use(json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const [result] = await db.select({ count: sql`1` }).from(users);
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.get('/api/database-connections', async (req, res) => {
  try {
    const connections = await storage.getDatabaseConnections();
    res.json(connections);
  } catch (error) {
    console.error('Error fetching database connections:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب اتصالات قواعد البيانات' });
  }
});

app.get('/api/social-accounts', async (req, res) => {
  try {
    const accounts = await storage.getSocialMediaAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب حسابات التواصل الاجتماعي' });
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
  console.log(`Server running on port ${PORT}`);
});