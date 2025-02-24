import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertUserSchema, type User, type InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type LoginData = Pick<InsertUser, "username" | "password">;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useLoginMutation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials.username);
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "فشل تسجيل الدخول");
      }
      const data = await res.json();
      console.log("Login successful:", data);
      return data;
    },
    onSuccess: (user: User) => {
      console.log("Login mutation success, redirecting to /");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${user.name}`,
      });
      setLocation("/");
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: InsertUser) => {
      console.log("Attempting registration with:", data.username);
      const res = await apiRequest("POST", "/api/register", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "فشل إنشاء الحساب");
      }
      const userData = await res.json();
      console.log("Registration successful:", userData);
      return userData;
    },
    onSuccess: (user: User) => {
      console.log("Registration mutation success, redirecting to /");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً ${user.name}`,
      });
      setLocation("/");
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      console.log("Attempting logout");
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "فشل تسجيل الخروج");
      }
    },
    onSuccess: () => {
      console.log("Logout successful, redirecting to /auth");
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      setLocation("/auth");
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log("AuthProvider rendering");
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 0,
    gcTime: 0,
  });

  console.log("Current user state:", { user, isLoading, error });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}