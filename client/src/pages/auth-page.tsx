import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { loginMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true })),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="w-full">
          <CardHeader className="text-2xl font-bold text-center">
            نظام إدارة الأعمال
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "جاري التحميل..." : "تسجيل الدخول"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="hidden lg:flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4 text-right">مرحباً بك في نظام إدارة الأعمال</h1>
          <p className="text-gray-600 text-right">
            نظام متكامل لإدارة العملاء والمواعيد والموظفين
          </p>
        </div>
      </div>
    </div>
  );
}