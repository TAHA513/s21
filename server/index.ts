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

// Basic middleware
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
const isDevelopment = process.env.NODE_ENV !== 'production';
app.use(
  helmet({
    contentSecurityPolicy: isDevelopment ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'", "https:", "http:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Serve static files before API routes
if (isDevelopment) {
  console.log('Running in development mode');
  app.use('/', express.static(path.join(__dirname, '../client/public')));
} else {
  console.log('Running in production mode');
  app.use('/', express.static(path.join(__dirname, '../client/dist')));
}

// API Routes
app.get('/api/store-settings', async (req, res) => {
  try {
    const settings = await storage.getStoreSettings();
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب إعدادات المتجر' });
  }
});

app.post('/api/store-settings', async (req, res) => {
  try {
    const settings = await storage.updateStoreSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث إعدادات المتجر' });
  }
});

// Handle client-side routing - must be after API routes
app.get('*', (req, res) => {
  const indexPath = isDevelopment 
    ? path.join(__dirname, '../client/public/index.html')
    : path.join(__dirname, '../client/dist/index.html');
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});