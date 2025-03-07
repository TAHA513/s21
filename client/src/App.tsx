
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center my-8">مرحباً بكم في نظام إدارة المتجر</h1>
          <p className="text-center">تم تشغيل التطبيق بنجاح</p>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
