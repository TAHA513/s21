import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  // لا نظهر شريط التنقل في صفحة تسجيل الدخول
  if (location === "/auth") {
    return null;
  }

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">متجر إدارة الأعمال</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-foreground ml-2">مرحباً {user.name}</span>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default">تسجيل الدخول</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}