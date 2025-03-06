import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreSettings } from "@/types";
import { useStoreSettings } from "@/hooks/use-store-settings";

export function StoreSettingsCard() {
  const { storeSettings, updateStoreSettings } = useStoreSettings();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateStoreSettings({
          storeLogo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>معلومات المتجر</CardTitle>
            <CardDescription>
              إدارة معلومات المتجر والشعار
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>اسم المتجر</Label>
          <Input
            placeholder="أدخل اسم المتجر"
            defaultValue={storeSettings?.storeName || ""}
            onChange={(e) => {
              updateStoreSettings({ storeName: e.target.value });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>شعار المتجر</Label>
          <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
            {storeSettings?.storeLogo ? (
              <div className="relative">
                <img
                  src={storeSettings.storeLogo}
                  alt="شعار المتجر"
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-0 right-0 mt-2 mr-2"
                  onClick={() => {
                    updateStoreSettings({ storeLogo: "" });
                  }}
                >
                  حذف
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  اسحب وأفلت الشعار هنا أو اضغط للتحميل
                </p>
              </div>
            )}

            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.getElementById("logo-upload") as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
              >
                <Upload className="h-4 w-4 ml-2" />
                تحميل شعار جديد
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
