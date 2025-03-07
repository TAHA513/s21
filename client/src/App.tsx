import { useEffect } from 'react';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-3xl font-bold mb-4">نظام إدارة الأعمال</h1>
      <p className="text-xl mb-8">مرحبًا بك في نظام إدارة الأعمال</p>
      <div className="p-6 bg-card rounded-lg shadow-lg">
        <h2 className="text-xl mb-4">جاري إعداد النظام...</h2>
        <p>الرجاء الانتظار حتى اكتمال الإعداد</p>
      </div>
    </div>
  );
}

export default App;