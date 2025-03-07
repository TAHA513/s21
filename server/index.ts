import express from 'express';
import session from 'express-session';
import { db } from './db';
import { storage } from './storage';
import { json } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';

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
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);

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

app.post('/api/database-connections', async (req, res) => {
  try {
    const connection = await storage.createDatabaseConnection(req.body);
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating database connection:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء اتصال قاعدة البيانات' });
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

app.post('/api/social-accounts', async (req, res) => {
  try {
    const account = await storage.createSocialMediaAccount(req.body);
    res.json(account);
  } catch (error) {
    console.error('Error creating social account:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء حساب التواصل الاجتماعي' });
  }
});

// Handle frontend routing
if (process.env.NODE_ENV === 'production') {
  // Serve static files in production
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // In development, redirect to Vite dev server for non-API routes
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.redirect(`http://localhost:5173${req.url}`);
  });
}

// ALWAYS serve the app on port 5000
const PORT = parseInt(process.env.PORT || '5000');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});