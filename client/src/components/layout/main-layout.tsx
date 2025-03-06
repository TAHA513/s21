import { ReactNode } from 'react';
import Link from 'next/link';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">نظام إدارة الأعمال</div>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-primary">الرئيسية</Link>
              <Link href="/settings" className="hover:text-primary">الإعدادات</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
