import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
      name: "",
    },
  });

  const onSubmit = isLogin
    ? loginForm.handleSubmit((data) => loginMutation.mutate(data))
    : registerForm.handleSubmit((data) => registerMutation.mutate(data));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="اسم المستخدم"
              {...(isLogin ? loginForm.register("username") : registerForm.register("username"))}
            />
            {isLogin
              ? loginForm.formState.errors.username?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )
              : registerForm.formState.errors.username?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
          </div>

          {!isLogin && (
            <>
              <div>
                <Input
                  placeholder="البريد الإلكتروني"
                  type="email"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="رقم الهاتف"
                  {...registerForm.register("phone")}
                />
                {registerForm.formState.errors.phone?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="الاسم"
                  {...registerForm.register("name")}
                />
                {registerForm.formState.errors.name?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <Input
              placeholder="كلمة المرور"
              type="password"
              {...(isLogin ? loginForm.register("password") : registerForm.register("password"))}
            />
            {isLogin
              ? loginForm.formState.errors.password?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )
              : registerForm.formState.errors.password?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLogin ? loginMutation.isPending : registerMutation.isPending}
          >
            {isLogin
              ? loginMutation.isPending
                ? "جاري تسجيل الدخول..."
                : "تسجيل الدخول"
              : registerMutation.isPending
              ? "جاري إنشاء الحساب..."
              : "إنشاء حساب"}
          </Button>

          <p className="text-center mt-4">
            {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline mr-2"
            >
              {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
}