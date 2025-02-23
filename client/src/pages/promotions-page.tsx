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
import { useQuery, useMutation } from "@tanstack/react-query";
import { Promotion, DiscountCode } from "@shared/schema";
import { Ticket, Tag, Copy, BookTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiscountCodeForm } from "@/components/marketing/discount-code-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PromotionsPage() {
  const { toast } = useToast();
  const [isDiscountCodeDialogOpen, setIsDiscountCodeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add debug console logs
  console.log('Rendering PromotionsPage');

  const { 
    data: promotions = [], 
    isLoading: promotionsLoading,
    error: promotionsError
  } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
    onError: (error) => {
      console.error('Error fetching promotions:', error);
    }
  });

  const { 
    data: discountCodes = [], 
    isLoading: codesLoading,
    error: codesError
  } = useQuery<DiscountCode[]>({
    queryKey: ["/api/discount-codes"],
    onError: (error) => {
      console.error('Error fetching discount codes:', error);
    }
  });

  // Add debug logs
  console.log('Promotions:', promotions);
  console.log('Discount Codes:', discountCodes);
  console.log('Loading states:', { promotionsLoading, codesLoading });
  console.log('Errors:', { promotionsError, codesError });

  // Duplicate promotion mutation
  const duplicatePromotion = useMutation({
    mutationFn: async (promotion: Promotion) => {
      const response = await apiRequest("POST", "/api/promotions/duplicate", { id: promotion.id });
      if (!response.ok) throw new Error('Failed to duplicate promotion');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      toast({
        title: "تم النسخ بنجاح",
        description: "تم نسخ العرض الترويجي بنجاح",
      });
    },
  });

  // Save as template mutation
  const saveAsTemplate = useMutation({
    mutationFn: async (promotion: Promotion) => {
      const response = await apiRequest("POST", "/api/promotion-templates", { promotionId: promotion.id });
      if (!response.ok) throw new Error('Failed to save template');
      return response;
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ كقالب",
        description: "تم حفظ العرض كقالب بنجاح",
      });
    },
  });

  const filteredPromotions = promotions.filter((promotion) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      promotion.name.toLowerCase().includes(searchLower) ||
      (promotion.description?.toLowerCase().includes(searchLower) ?? false) ||
      promotion.discountType.toLowerCase().includes(searchLower) ||
      promotion.status.toLowerCase().includes(searchLower)
    );
  });

  const filteredDiscountCodes = discountCodes.filter((code) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return code.code.toLowerCase().includes(searchLower);
  });

  if (promotionsError || codesError) {
    console.error('Render error:', { promotionsError, codesError });
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium mb-2">حدث خطأ أثناء تحميل البيانات</h3>
            <p className="text-red-600 text-sm">
              {promotionsError ? String(promotionsError) : String(codesError)}
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
                queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
              }}
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (promotionsLoading || codesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">العروض والخصومات</h1>
          <div className="space-x-4">
            <Dialog open={isDiscountCodeDialogOpen} onOpenChange={setIsDiscountCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Tag className="h-4 w-4 ml-2" />
                  إنشاء كود خصم
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إنشاء كود خصم جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات كود الخصم الجديد
                  </DialogDescription>
                </DialogHeader>
                <DiscountCodeForm
                  onSuccess={() => {
                    setIsDiscountCodeDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button>
              <Ticket className="h-4 w-4 ml-2" />
              عرض جديد
            </Button>
          </div>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في العروض والخصومات..."
          />
        </div>

        <Tabs defaultValue="promotions">
          <TabsList>
            <TabsTrigger value="promotions">العروض الترويجية</TabsTrigger>
            <TabsTrigger value="codes">أكواد الخصم</TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العرض</TableHead>
                  <TableHead>نوع الخصم</TableHead>
                  <TableHead>قيمة الخصم</TableHead>
                  <TableHead>تاريخ البدء</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length > 0 ? (
                  filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-medium">
                        {promotion.name}
                        {promotion.description && (
                          <p className="text-sm text-muted-foreground">{promotion.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {promotion.discountType === "percentage" ? "نسبة مئوية" : "قيمة ثابتة"}
                      </TableCell>
                      <TableCell>
                        {promotion.discountType === "percentage"
                          ? `${promotion.discountValue}%`
                          : `${promotion.discountValue} ريال`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(promotion.startDate), 'dd MMMM yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(promotion.endDate), 'dd MMMM yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={promotion.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'}
                        >
                          {promotion.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              المزيد
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => duplicatePromotion.mutate(promotion)}>
                              <Copy className="h-4 w-4 ml-2" />
                              نسخ العرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => saveAsTemplate.mutate(promotion)}>
                              <BookTemplate className="h-4 w-4 ml-2" />
                              حفظ كقالب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="codes" className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود الخصم</TableHead>
                  <TableHead>العرض المرتبط</TableHead>
                  <TableHead>حد الاستخدام</TableHead>
                  <TableHead>عدد الاستخدام</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscountCodes.length > 0 ? (
                  filteredDiscountCodes.map((code) => {
                    const linkedPromotion = promotions.find(p => p.id === code.promotionId);
                    return (
                      <TableRow key={code.id}>
                        <TableCell className="font-medium">{code.code}</TableCell>
                        <TableCell>{linkedPromotion?.name ?? 'غير مرتبط'}</TableCell>
                        <TableCell>{code.usageLimit}</TableCell>
                        <TableCell>{code.usageCount}</TableCell>
                        <TableCell>
                          {code.expiresAt
                            ? format(new Date(code.expiresAt), 'dd MMMM yyyy', { locale: ar })
                            : 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            تعديل
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}