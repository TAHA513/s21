import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FC } from "react";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: FC;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}