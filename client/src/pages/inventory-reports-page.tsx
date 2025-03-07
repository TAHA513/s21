import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function InventoryReportsPage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const retailProducts = products.filter(p => p.type === "piece");
  const wholesaleProducts = products.filter(p => p.type === "weight");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير المخزون</h1>
          <p className="text-muted-foreground">عرض تفصيلي لأرصدة المخزون</p>
        </div>

        <Tabs defaultValue="retail" className="space-y-4">
          <TabsList>
            <TabsTrigger value="retail">المفرد</TabsTrigger>
            <TabsTrigger value="wholesale">الجملة</TabsTrigger>
          </TabsList>

          <TabsContent value="retail" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل منتجات المفرد</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الباركود</TableHead>
                      <TableHead>الكمية المتوفرة</TableHead>
                      <TableHead>سعر التكلفة</TableHead>
                      <TableHead>سعر البيع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retailProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.barcode || '-'}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{formatCurrency(Number(product.costPrice))}</TableCell>
                        <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                      </TableRow>
                    ))}
                    {retailProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          لا توجد منتجات مفردة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wholesale" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل منتجات الجملة</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الباركود</TableHead>
                      <TableHead>الوزن المتوفر</TableHead>
                      <TableHead>سعر التكلفة للكيلو</TableHead>
                      <TableHead>سعر البيع للكيلو</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wholesaleProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.barcode || '-'}</TableCell>
                        <TableCell>{product.quantity} كغم</TableCell>
                        <TableCell>{formatCurrency(Number(product.costPrice))}</TableCell>
                        <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                      </TableRow>
                    ))}
                    {wholesaleProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          لا توجد منتجات جملة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}