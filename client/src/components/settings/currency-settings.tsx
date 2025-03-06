import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStoreSettings } from "@/hooks/use-store-settings";

const currencySettingsSchema = z.object({
  defaultCurrency: z.enum(['USD', 'IQD'], {
    required_error: "يرجى اختيار العملة الافتراضية"
  }),
  usdToIqdRate: z.number()
    .min(1, "يجب أن يكون سعر الصرف أكبر من 0")
    .max(999999, "سعر الصرف غير صالح"),
});

type CurrencySettings = z.infer<typeof currencySettingsSchema>;

export function CurrencySettingsCard() {
  const { updateStoreSettings, storeSettings, isLoading } = useStoreSettings();

  const form = useForm<CurrencySettings>({
    resolver: zodResolver(currencySettingsSchema),
    defaultValues: {
      defaultCurrency: storeSettings?.defaultCurrency || 'USD',
      usdToIqdRate: storeSettings?.usdToIqdRate || 1460,
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>إعدادات العملة</CardTitle>
            <CardDescription>
              تحديد العملة الافتراضية وسعر الصرف
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            updateStoreSettings({ currencySettings: data });
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العملة الافتراضية</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العملة الافتراضية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">دولار أمريكي</SelectItem>
                      <SelectItem value="IQD">دينار عراقي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usdToIqdRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر صرف الدولار مقابل الدينار العراقي</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      placeholder="أدخل سعر الصرف"
                    />
                  </FormControl>
                  <FormDescription>
                    1 دولار = كم دينار عراقي
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ إعدادات العملة"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
