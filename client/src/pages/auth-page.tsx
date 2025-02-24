import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("عنوان البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن لا يقل عن 10 أرقام"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // التوجيه إذا كان المستخدم مسجل دخوله
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: LoginData | RegisterData) => {
    try {
      if (isLogin) {
        await loginMutation.mutateAsync(data as LoginData);
      } else {
        await registerMutation.mutateAsync(data as RegisterData);
      }
    } catch (error) {
      toast({
        title: isLogin ? "فشل تسجيل الدخول" : "فشل إنشاء الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h1>

        <form onSubmit={isLogin ? loginForm.handleSubmit(onSubmit) : registerForm.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="اسم المستخدم"
              {...(isLogin ? loginForm.register("username") : registerForm.register("username"))}
            />
            {isLogin ? (
              <FormError error={loginForm.formState.errors.username} />
            ) : (
              <FormError error={registerForm.formState.errors.username} />
            )}
          </div>

          {!isLogin && (
            <>
              <div>
                <Input
                  placeholder="الاسم"
                  {...registerForm.register("name")}
                />
                <FormError error={registerForm.formState.errors.name} />
              </div>
              <div>
                <Input
                  placeholder="البريد الإلكتروني"
                  type="email"
                  {...registerForm.register("email")}
                />
                <FormError error={registerForm.formState.errors.email} />
              </div>
              <div>
                <Input
                  placeholder="رقم الهاتف"
                  {...registerForm.register("phone")}
                />
                <FormError error={registerForm.formState.errors.phone} />
              </div>
            </>
          )}

          <div>
            <Input
              placeholder="كلمة المرور"
              type="password"
              {...(isLogin ? loginForm.register("password") : registerForm.register("password"))}
            />
            {isLogin ? (
              <FormError error={loginForm.formState.errors.password} />
            ) : (
              <FormError error={registerForm.formState.errors.password} />
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

function FormError({ error }: { error: any }) {
  if (!error?.message) return null;
  return <p className="text-red-500 text-sm mt-1">{error.message}</p>;
}