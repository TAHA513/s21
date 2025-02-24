import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FC } from "react";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: FC;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  console.log("ProtectedRoute state:", { user, isLoading });

  // عرض مؤشر التحميل أثناء التحقق من حالة المستخدم
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // إعادة التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مسجل دخوله
  if (!user) {
    console.log("User not authenticated, redirecting to /auth");
    return <Redirect to="/auth" />;
  }

  console.log("User authenticated, rendering protected component");
  // عرض المكون إذا كان المستخدم مسجل دخوله
  return <Component />;
}