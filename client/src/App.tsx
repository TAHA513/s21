import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
const DashboardPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">لوحة التحكم</h1>
    <p className="text-gray-600">مرحباً بك في نظام إدارة الأعمال</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">الإعدادات</h1>
    <p className="text-gray-600">إعدادات النظام</p>
  </div>
);

// Create a client
const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">نظام إدارة الأعمال</div>
            <div className="flex gap-4">
              <a href="/" className="hover:text-primary">الرئيسية</a>
              <a href="/settings" className="hover:text-primary">الإعدادات</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto">
        <Switch>
          <Route path="/settings" component={SettingsPage} />
          <Route path="/" component={DashboardPage} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;