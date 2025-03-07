
import express from "express";
import { isAuthenticated, registerUser } from "../auth.js";
import { db } from "../db.js";
import { users } from "../../shared/schema.js";
import passport from "passport";

const router = express.Router();

// مسار الصحة للتحقق من حالة الخادم
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// مسار المستخدم الحالي
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password, ...user } = req.user as any;
    return res.json(user);
  }
  res.status(401).json({ message: "غير مصرح" });
});

// مسار تسجيل الدخول
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "فشل تسجيل الدخول" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const { password, ...userData } = user as any;
      return res.json(userData);
    });
  })(req, res, next);
});

// مسار تسجيل الخروج
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
    }
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });
});

// مسار التسجيل
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // تسجيل مستخدم جديد
    const newUser = await registerUser(name, email, phone, password);
    
    // تسجيل دخول المستخدم تلقائيًا بعد التسجيل
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "خطأ في تسجيل الدخول بعد التسجيل" });
      }
      const { password, ...userData } = newUser as any;
      return res.status(201).json(userData);
    });
  } catch (error: any) {
    if (error.message === "البريد الإلكتروني مسجل بالفعل") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// مسار محمي يتطلب المصادقة
router.get("/protected", isAuthenticated, (req, res) => {
  res.json({ message: "هذه بيانات محمية", user: req.user });
});

export default router;
