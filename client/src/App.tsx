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
              <p className="text-xl">تم تشغيل الواجهة الأمامية بنجاح</p>
            </div>
          </div>
        </Route>
        <Route>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold">صفحة غير موجودة</h1>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default App;