
import React from 'react';
import { Route, Switch } from 'wouter';

const App: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/" exact>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 rounded-lg shadow-lg bg-card">
              <h1 className="text-3xl font-bold mb-4">مرحباً بك في النظام</h1>
              <p className="text-xl mb-4">تم تشغيل الواجهة الأمامية بنجاح</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
                <a href="/dashboard" className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  لوحة التحكم
                </a>
                <a href="/settings" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                  الإعدادات
                </a>
              </div>
            </div>
          </div>
        </Route>
        <Route path="/dashboard">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 rounded-lg shadow-lg bg-card">
              <h1 className="text-3xl font-bold mb-4">لوحة التحكم</h1>
              <p className="text-xl">مرحباً بك في لوحة التحكم</p>
            </div>
          </div>
        </Route>
        <Route>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 rounded-lg shadow-lg bg-card">
              <h1 className="text-3xl font-bold mb-4">صفحة غير موجودة</h1>
              <p className="text-xl mb-4">الصفحة التي تبحث عنها غير موجودة</p>
              <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-md inline-block hover:bg-primary/90">
                العودة للرئيسية
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default App;
