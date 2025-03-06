import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Settings as SettingsIcon, Paintbrush, Database, Download } from "lucide-react";
import { StoreSettingsCard } from "@/components/settings/store-settings";
import { CurrencySettingsCard } from "@/components/settings/currency-settings";
import { AppearanceSettingsCard } from "@/components/settings/appearance-settings";
import { BackupSettingsCard } from "@/components/settings/backup-settings";
import { useQuery } from "@tanstack/react-query";
import { DatabaseConnectionDialog } from "@/components/settings/database-connection-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";


const { data: connections } = useQuery({
    queryKey: ['databaseConnections'],
    queryFn: () => {
      // Replace with your actual database connection fetching logic
      return Promise.resolve([{
        id: '1',
        name: 'Main Database',
        type: 'MySQL',
        host: 'localhost',
        database: 'mydb',
        isActive: true,
        createdAt: new Date().toISOString()
      }]);
    }
  });

export default function SettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والتكاملات</p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-4">
            <TabsTrigger value="store" className="space-x-2">
              <Building2 className="h-4 w-4" />
              <span>المتجر</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span>التكاملات</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="space-x-2">
              <Paintbrush className="h-4 w-4" />
              <span>المظهر</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="space-x-2">
              <Database className="h-4 w-4" />
              <span>قواعد البيانات</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="space-x-2">
              <Download className="h-4 w-4" />
              <span>النسخ الاحتياطي</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-6">
            <StoreSettingsCard />
            <CurrencySettingsCard />
          </TabsContent>

          <TabsContent value="integrations">
            {/* Will add integration components here */}
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <AppearanceSettingsCard />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="space-y-6">
              <DatabaseConnectionDialog />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border rounded-lg"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الاتصال</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>المضيف</TableHead>
                      <TableHead>قاعدة البيانات</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections?.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="font-medium">{connection.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Database className="h-4 w-4 ml-2" />
                            {connection.type}
                          </div>
                        </TableCell>
                        <TableCell>{connection.host || '-'}</TableCell>
                        <TableCell>{connection.database || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={connection.isActive ? "default" : "secondary"}>
                            {connection.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(connection.createdAt).toLocaleDateString('ar-IQ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              تحرير
                            </Button>
                            <Button variant="destructive" size="sm">
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!connections?.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          لا توجد اتصالات حالياً
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <BackupSettingsCard />
          </TabsContent>
        </Tabs>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>ربط حسابات التواصل الاجتماعي</DialogTitle>
                <DialogDescription>
                  اختر إحدى المنصات التالية للربط مع حسابك
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/*Social media login buttons removed for brevity*/}
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  أو يمكنك إدخال بيانات الحساب يدوياً
                </p>
              </div>

              {/* Form removed for brevity */}
            </DialogContent>
          </Dialog>
      </div>
    </DashboardLayout>
  );
}