import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">متجر إدارة الأعمال</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost">المنتجات</Button>
            </Link>
            <Link href="/invoices">
              <Button variant="ghost">الفواتير</Button>
            </Link>
            <Link href="/customers">
              <Button variant="ghost">العملاء</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}