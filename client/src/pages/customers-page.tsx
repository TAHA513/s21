
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import { UserPlus } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/customer-form";

export default function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // تحسين استدعاء البيانات - تعديل لإصلاح مشكلة الاستعلام
  const { data: customers = [], refetch } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات العملاء");
      }
      const data = await response.json();
      console.log("بيانات العملاء:", data);
      return data;
    },
    refetchOnWindowFocus: true
  });

  const filteredCustomers = customers?.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      (customer.email?.toLowerCase().includes(searchLower) ?? false) ||
      (customer.notes?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    // إعادة تحميل البيانات مباشرة
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">العملاء</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات العميل الجديد
                </DialogDescription>
              </DialogHeader>
              <CustomerForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن عميل..."
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء حتى الآن'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
