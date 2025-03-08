import express, { type Express } from "express";
import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server): Promise<void> {
  // استخدام Vite فقط في بيئة التطوير
  if (process.env.NODE_ENV === "production") {
    const distPath = resolve(__dirname, "../dist/public");

    // التحقق من وجود مجلد التوزيع قبل استخدامه
    if (!fs.existsSync(distPath)) {
      console.error(`تحذير: مجلد التوزيع غير موجود: ${distPath}`);
      console.error(`تأكد من تنفيذ أمر البناء 'npm run build' قبل تشغيل الخادم في وضع الإنتاج`);
    } else {
      console.log(`تم العثور على مجلد التوزيع: ${distPath}`);
    }

    // تقديم الملفات الثابتة المجمّعة في بيئة الإنتاج
    app.use(express.static(distPath, { maxAge: '1d' }));
    
    // معالجة جميع المسارات التي لا تبدأ بـ /api/ وإعادتها إلى index.html للتطبيقات ذات الصفحة الواحدة (SPA)
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      const indexPath = resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        console.log(`توجيه الطلب ${req.path} إلى index.html`);
        res.sendFile(indexPath);
      } else {
        console.error(`ملف index.html غير موجود في ${distPath}`);
        res.status(404).send("404 - الصفحة غير موجودة");
      }
    });

    console.log("تم تكوين الخادم لبيئة الإنتاج بنجاح");
    return;
  }

  // إعداد Vite في بيئة التطوير
  try {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: server,
        },
      },
      root: resolve(__dirname, "../client"),
      appType: "spa",
    });

    // استخدام الخوادم الوسيطة لـ Vite
    app.use(vite.middlewares);
  } catch (e) {
    console.error("خطأ في إعداد Vite:", e);
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}