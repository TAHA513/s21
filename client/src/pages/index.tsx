import { MainLayout } from '@/components/layout/main-layout';

export default function HomePage() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">لوحة التحكم</h1>
        <p className="text-gray-600">مرحباً بك في نظام إدارة الأعمال</p>
      </div>
    </MainLayout>
  );
}
