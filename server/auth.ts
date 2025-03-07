
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { users } from "../shared/schema.js";

// إعداد استراتيجية المصادقة المحلية
export function setupPassport() {
  // استراتيجية تسجيل الدخول المحلية باستخدام البريد الإلكتروني وكلمة المرور
  passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await db.select().from(users).where({ email }).limit(1);
        
        if (!user || user.length === 0) {
          return done(null, false, { message: "البريد الإلكتروني غير موجود" });
        }
        
        const isMatch = await bcrypt.compare(password, user[0].password);
        
        if (!isMatch) {
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }
        
        return done(null, user[0]);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // تخزين معرف المستخدم في الجلسة
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // استرجاع المستخدم من معرف الجلسة
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.select().from(users).where({ id }).limit(1);
      done(null, user[0] || null);
    } catch (error) {
      done(error, null);
    }
  });

  return passport;
}

// وظيفة للتحقق من المصادقة في طلبات API
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "غير مصرح" });
}

// وظيفة لتسجيل مستخدم جديد مع تشفير كلمة المرور
export async function registerUser(name: string, email: string, phone: string, password: string) {
  // التحقق مما إذا كان المستخدم موجودًا بالفعل
  const existingUser = await db.select().from(users).where({ email }).limit(1);
  
  if (existingUser && existingUser.length > 0) {
    throw new Error("البريد الإلكتروني مسجل بالفعل");
  }
  
  // تشفير كلمة المرور
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // إنشاء مستخدم جديد
  const newUser = await db.insert(users).values({
    name,
    email,
    phone,
    password: hashedPassword,
  }).returning();
  
  return newUser[0];
}
