import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import StaffDashboard from "@/pages/staff/dashboard";
import CustomersPage from "@/pages/customers-page";
import AppointmentsPage from "@/pages/appointments-page";
import StaffPage from "@/pages/staff-page";
import MarketingPage from "@/pages/marketing-page";
import PromotionsPage from "@/pages/promotions-page";
import ProductsPage from "@/pages/products-page";
import BarcodesPage from "@/pages/barcodes-page";
import InvoicesPage from "@/pages/invoices-page";
import InstallmentsPage from "@/pages/installments-page";
import ReportsPage from "@/pages/reports-page";
import PurchasesPage from "@/pages/purchases-page";
import SuppliersPage from "@/pages/suppliers-page";
import ExpensesPage from "@/pages/expenses-page";
import ExpenseCategoriesPage from "@/pages/expense-categories-page";
import SettingsPage from "@/pages/settings-page";
import InventoryReportsPage from "@/pages/inventory-reports-page";
import { useEffect } from "react";
import { loadThemeSettings } from "@/lib/theme";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

function Router() {
  // Load theme settings on app initialization
  useEffect(() => {
    loadThemeSettings();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          {/* Only one auth route */}
          <Route path="/auth" component={AuthPage} />

          {/* Protected Routes */}
          <Route path="/" component={() => <ProtectedRoute component={DashboardPage} />} />
          <Route path="/staff" component={() => <ProtectedRoute component={StaffDashboard} />} />
          <Route path="/purchases" component={() => <ProtectedRoute component={PurchasesPage} />} />
          <Route path="/suppliers" component={() => <ProtectedRoute component={SuppliersPage} />} />
          <Route path="/customers" component={() => <ProtectedRoute component={CustomersPage} />} />
          <Route path="/appointments" component={() => <ProtectedRoute component={AppointmentsPage} />} />
          <Route path="/staff-management" component={() => <ProtectedRoute component={StaffPage} />} />
          <Route path="/marketing" component={() => <ProtectedRoute component={MarketingPage} />} />
          <Route path="/promotions" component={() => <ProtectedRoute component={PromotionsPage} />} />
          <Route path="/products" component={() => <ProtectedRoute component={ProductsPage} />} />
          <Route path="/invoices" component={() => <ProtectedRoute component={InvoicesPage} />} />
          <Route path="/installments" component={() => <ProtectedRoute component={InstallmentsPage} />} />
          <Route path="/expenses" component={() => <ProtectedRoute component={ExpensesPage} />} />
          <Route path="/expense-categories" component={() => <ProtectedRoute component={ExpenseCategoriesPage} />} />
          <Route path="/reports" component={() => <ProtectedRoute component={ReportsPage} />} />
          <Route path="/inventory-reports" component={() => <ProtectedRoute component={InventoryReportsPage} />} />
          <Route path="/barcodes" component={() => <ProtectedRoute component={BarcodesPage} />} />
          <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />

          {/* 404 Route */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;