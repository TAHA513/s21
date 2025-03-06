import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStoreSettings } from "@/hooks/use-store-settings";

const colorOptions = [
  { type: 'solid', color: "#0ea5e9", name: "أزرق" },
  { type: 'solid', color: "#10b981", name: "أخضر" },
  { type: 'solid', color: "#8b5cf6", name: "بنفسجي" },
  { type: 'solid', color: "#ef4444", name: "أحمر" },
  { type: 'solid', color: "#f59e0b", name: "برتقالي" },
] as const;

const fontSizeOptions = [
  { value: "small", label: "صغير" },
  { value: "medium", label: "متوسط" },
  { value: "large", label: "كبير" },
] as const;

const fontFamilyOptions = [
  { value: "cairo", label: "Cairo" },
  { value: "tajawal", label: "Tajawal" },
  { value: "almarai", label: "Almarai" },
] as const;

export function AppearanceSettingsCard() {
  const { storeSettings, updateStoreSettings } = useStoreSettings();
  const [selectedColor, setSelectedColor] = useState<string>(storeSettings?.theme?.primary || colorOptions[0].color);
  const [selectedFontSize, setSelectedFontSize] = useState<string>(storeSettings?.theme?.fontSize || "medium");
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(storeSettings?.theme?.fontFamily || "tajawal");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Paintbrush className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>مظهر التطبيق</CardTitle>
            <CardDescription>
              تخصيص مظهر التطبيق والألوان والخطوط
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>لون النظام الأساسي</Label>
          <div className="grid grid-cols-5 gap-4">
            {colorOptions.map((option) => (
              <button
                key={option.color}
                className={cn(
                  "h-12 rounded-md border-2 transition-all",
                  selectedColor === option.color
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-border"
                )}
                style={{ backgroundColor: option.color }}
                onClick={() => {
                  setSelectedColor(option.color);
                  updateStoreSettings({
                    theme: {
                      ...storeSettings?.theme,
                      primary: option.color,
                    },
                  });
                }}
              >
                <span className="sr-only">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>حجم الخط</Label>
          <div className="grid grid-cols-3 gap-4">
            {fontSizeOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFontSize === option.value ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  setSelectedFontSize(option.value);
                  updateStoreSettings({
                    theme: {
                      ...storeSettings?.theme,
                      fontSize: option.value,
                    },
                  });
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>نوع الخط</Label>
          <div className="grid grid-cols-3 gap-4">
            {fontFamilyOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFontFamily === option.value ? "default" : "outline"}
                className={`w-full font-${option.value}`}
                onClick={() => {
                  setSelectedFontFamily(option.value);
                  updateStoreSettings({
                    theme: {
                      ...storeSettings?.theme,
                      fontFamily: option.value,
                    },
                  });
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
