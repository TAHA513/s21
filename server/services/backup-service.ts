import { storage } from '../storage';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

class BackupService {
  private backupDir = 'backups';

  constructor() {
    // إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجوداً
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  async generateBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}.zip`);
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    // جمع البيانات من جميع الجداول
    const data = {
      customers: await storage.getCustomers(),
      products: await storage.getProducts(),
      productGroups: await storage.getProductGroups(),
      invoices: await storage.getInvoices(),
    };

    // إضافة البيانات إلى الأرشيف
    archive.append(JSON.stringify(data, null, 2), { name: 'data.json' });

    await archive.finalize();

    return backupPath;
  }

  async restoreBackup(backupPath: string): Promise<void> {
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // استعادة البيانات لكل جدول
    for (const customer of data.customers) {
      await storage.createCustomer(customer);
    }

    for (const group of data.productGroups) {
      await storage.createProductGroup(group);
    }

    for (const product of data.products) {
      await storage.createProduct(product);
    }

    for (const invoice of data.invoices) {
      await storage.createInvoice(invoice);
    }
  }
}

export const backupService = new BackupService();
