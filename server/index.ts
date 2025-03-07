
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// استخدام ESM مع __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// استخدام الملفات الثابتة من مجلد dist/public بعد البناء
app.use(express.static(path.join(__dirname, "..", "dist", "public")));

// تحميل ملفات واجهة المستخدم في وضع التطوير
if (process.env.NODE_ENV !== "production") {
  // استخدام vite في وضع التطوير
  const vite = await import("vite");
  const viteDevMiddleware = (
    await vite.createServer({
      root: path.resolve(__dirname, "..", "client"),
      server: { middlewareMode: true },
    })
  ).middlewares;
  
  app.use(viteDevMiddleware);
} else {
  // توجيه جميع الطلبات إلى index.html في وضع الإنتاج
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "public", "index.html"));
  });
}

// تهيئة API endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "تم تشغيل النظام بنجاح" });
});

// تهيئة API endpoints إضافية
app.get("/api/database-connections", (req, res) => {
  res.json({ connections: [] });
});

app.post("/api/database-connections", (req, res) => {
  res.json({ success: true, message: "تم إنشاء الاتصال بنجاح" });
});

// استماع على جميع الواجهات
app.listen(port, "0.0.0.0", () => {
  console.log(`تم تشغيل الخادم على المنفذ ${port}`);
  console.log(`الواجهة متاحة على http://0.0.0.0:${port}`);
});
