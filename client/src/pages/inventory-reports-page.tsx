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
import { Package2, DollarSign, LineChart, TrendingUp, Wallet } from "lucide-react";
import type { Product } from "@shared/schema";

export default function InventoryReportsPage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const retailProducts = products.filter(p => p.type === "piece");
  const wholesaleProducts = products.filter(p => p.type === "weight");

  // حساب إجمالي قيمة المخزون بسعر التكلفة
  const totalInventoryCost = products.reduce((sum, product) => {
    return sum + (Number(product.quantity) * Number(product.costPrice))
  }, 0);

  // حساب إجمالي قيمة المخزون بسعر البيع
  const totalInventorySalePrice = products.reduce((sum, product) => {
    return sum + (Number(product.quantity) * Number(product.sellingPrice))
  }, 0);

  // حساب الربح المتوقع
  const expectedProfit = totalInventorySalePrice - totalInventoryCost;

  // حساب نسبة الربح
  const profitMargin = ((expectedProfit / totalInventoryCost) * 100).toFixed(2);

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
          <h1 className="text-3xl font-bold mb-2">تقارير المخزون والسيولة</h1>
          <p className="text-muted-foreground">عرض تفصيلي للسيولة المتوفرة وأرصدة المخزون</p>
        </div>

        {/* قسم السيولة */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رأس المال المستثمر</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInventoryCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجمالي تكلفة المخزون الحالي
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القيمة السوقية</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInventorySalePrice)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجمالي قيمة البيع للمخزون
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الربح المتوقع</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(expectedProfit)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجمالي الربح المتوقع
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profitMargin}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                نسبة الربح المتوقعة
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="retail" className="space-y-4">
          <TabsList>
            <TabsTrigger value="retail">المفرد</TabsTrigger>
            <TabsTrigger value="wholesale">الجملة</TabsTrigger>
          </TabsList>

          <TabsContent value="retail" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل مبيعات المفرد</CardTitle>
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
                      <TableHead>القيمة الإجمالية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retailProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.barcode || '-'}</TableCell>
                        <TableCell>{product.quantity.toString()}</TableCell>
                        <TableCell>{formatCurrency(Number(product.costPrice))}</TableCell>
                        <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(product.quantity) * Number(product.costPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {retailProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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
                <CardTitle>تفاصيل مبيعات الجملة</CardTitle>
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
                      <TableHead>القيمة الإجمالية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wholesaleProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.barcode || '-'}</TableCell>
                        <TableCell>{product.quantity.toString()} كغم</TableCell>
                        <TableCell>{formatCurrency(Number(product.costPrice))}</TableCell>
                        <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(product.quantity) * Number(product.costPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {wholesaleProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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