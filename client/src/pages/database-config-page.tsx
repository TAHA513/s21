
import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash, Database } from "lucide-react";
import { motion } from "framer-motion";
import type { DatabaseConnection } from "@shared/schema";
import { DatabaseConnectionDialog } from "@/components/database-connection-dialog";
import { Badge } from "@/components/ui/badge";
import { deleteDatabaseConnection, getDatabaseConnections } from "@/lib/database-config";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DatabaseConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectionToDelete, setConnectionToDelete] = useState<number | null>(null);

  // جلب قائمة الاتصالات
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["/api/database-connections"],
    queryFn: getDatabaseConnections,
  });

  // حذف اتصال
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDatabaseConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/database-connections"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف اتصال قاعدة البيانات بنجاح",
      });
      setConnectionToDelete(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف اتصال قاعدة البيانات",
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">إعدادات قاعدة البيانات</h1>
            <p className="text-muted-foreground">
              إدارة اتصالات قواعد البيانات في النظام
            </p>
          </div>
          <DatabaseConnectionDialog
            trigger={
              <Button className="transition-transform hover:scale-105">
                <Plus className="h-4 w-4 ml-2" />
                إضافة اتصال جديد
              </Button>
            }
          />
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المضيف</TableHead>
                <TableHead>المنفذ</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>قاعدة البيانات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    جاري تحميل البيانات...
                  </TableCell>
                </TableRow>
              ) : connections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    لا توجد اتصالات قاعدة بيانات. قم بإضافة اتصال جديد.
                  </TableCell>
                </TableRow>
              ) : (
                connections.map((connection: DatabaseConnection) => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 text-primary ml-2" />
                        {connection.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{connection.type}</Badge>
                    </TableCell>
                    <TableCell>{connection.host}</TableCell>
                    <TableCell>{connection.port}</TableCell>
                    <TableCell>{connection.username}</TableCell>
                    <TableCell>{connection.database}</TableCell>
                    <TableCell>
                      <Badge variant={connection.isActive ? "success" : "secondary"}>
                        {connection.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog
                        open={connectionToDelete === connection.id}
                        onOpenChange={(open) => !open && setConnectionToDelete(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConnectionToDelete(connection.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من حذف هذا الاتصال؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف اتصال قاعدة البيانات بشكل دائم.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => connectionToDelete && deleteMutation.mutate(connectionToDelete)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">تكوين قاعدة البيانات في ملف .env</h2>
          <p className="mb-4">
            يمكنك أيضًا تكوين اتصال قاعدة البيانات مباشرة في ملف .env. استخدم المتغير البيئي DATABASE_URL:
          </p>

          <div className="bg-muted p-4 rounded-md font-mono text-sm mb-4 overflow-auto">
            <pre>DATABASE_URL=postgres://username:password@host:port/database</pre>
          </div>

          <p>
            بعد تعيين متغير البيئة، سيتم استخدامه تلقائيًا من قبل التطبيق للاتصال بقاعدة البيانات.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
