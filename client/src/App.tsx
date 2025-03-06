import React from 'react';
import { useQuery } from '@tanstack/react-query';

function App() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: async () => {
      const response = await fetch('/api/store-settings');
      if (!response.ok) {
        throw new Error('فشل في جلب إعدادات المتجر');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">حدث خطأ: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">نظام إدارة الأعمال</div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">لوحة التحكم</h1>
        <p className="text-gray-600 mb-8">مرحباً بك في نظام إدارة الأعمال</p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">إعدادات المتجر</h2>
          {settings && (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
              {JSON.stringify(settings, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;