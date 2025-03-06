import express from 'express';
import session from 'express-session';
import { db } from './db';
import { storage } from './storage';
import { json } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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

app.get('/api/backup-configs', async (req, res) => {
  try {
    const configs = await storage.getBackupConfigs();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching backup configs:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب إعدادات النسخ الاحتياطي' });
  }
});

app.post('/api/backup-configs', async (req, res) => {
  try {
    const config = await storage.createBackupConfig(req.body);
    res.json(config);
  } catch (error) {
    console.error('Error creating backup config:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء إعداد النسخ الاحتياطي' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
