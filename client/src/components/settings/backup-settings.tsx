import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

async function generateBackup() {
  try {
    const response = await fetch('/api/backup/generate', {
      method: 'POST',
    });

    if (!response.ok) throw new Error('فشل إنشاء النسخة الاحتياطية');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generating backup:', error);
    return false;
  }
}

export function BackupSettingsCard() {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Download className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>النسخ الاحتياطي</CardTitle>
            <CardDescription>
              إنشاء واستعادة نسخ احتياطية للنظام
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-1">إنشاء نسخة احتياطية</h3>
              <p className="text-sm text-muted-foreground">
                تصدير نسخة احتياطية كاملة من النظام تتضمن:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>قاعدة البيانات</li>
                <li>إعدادات النظام</li>
                <li>الملفات والصور</li>
                <li>التكاملات والإعدادات</li>
              </ul>
            </div>
            <Button
              onClick={async () => {
                const success = await generateBackup();
                if (success) {
                  toast({
                    title: "تم بنجاح",
                    description: "تم إنشاء النسخة الاحتياطية وتحميلها",
                  });
                } else {
                  toast({
                    title: "حدث خطأ",
                    description: "فشل إنشاء النسخة الاحتياطية",
                    variant: "destructive",
                  });
                }
              }}
              className="min-w-[150px]"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير نسخة احتياطية
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">استعادة نسخة احتياطية</h3>
            <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-center text-muted-foreground">
                اسحب وأفلت ملف النسخة الاحتياطية هنا أو اضغط لاختيار الملف
              </p>
              <Input
                type="file"
                accept=".zip"
                className="hidden"
                id="backup-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append('backup', file);

                  try {
                    const response = await fetch('/api/backup/restore', {
                      method: 'POST',
                      body: formData,
                    });

                    if (!response.ok) throw new Error('فشل استعادة النسخة الاحتياطية');

                    toast({
                      title: "تم بنجاح",
                      description: "تم استعادة النسخة الاحتياطية",
                    });
                  } catch (error) {
                    console.error('Error restoring backup:', error);
                    toast({
                      title: "حدث خطأ",
                      description: "فشل استعادة النسخة الاحتياطية",
                      variant: "destructive",
                    });
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('backup-upload') as HTMLInputElement;
                  if (input) input.click();
                }}
              >
                <Upload className="h-4 w-4 ml-2" />
                اختيار ملف
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              * سيتم إيقاف النظام مؤقتاً أثناء عملية الاستعادة
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
