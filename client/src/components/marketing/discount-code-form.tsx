import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertDiscountCodeSchema, type InsertDiscountCode, type Promotion } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DialogClose } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DiscountCodeForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const form = useForm<InsertDiscountCode>({
    resolver: zodResolver(insertDiscountCodeSchema),
    defaultValues: {
      code: "",
      promotionId: undefined,
      usageLimit: 1,
      usageCount: 0,
      expiresAt: undefined,
    },
  });

  const onSubmit = async (data: InsertDiscountCode) => {
    try {
      await apiRequest("POST", "/api/discount-codes", data);

      queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });

      toast({
        title: "تم إضافة الكود",
        description: "تم إضافة كود الخصم بنجاح",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating discount code:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة كود الخصم",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كود الخصم</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل كود الخصم" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promotionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العرض المرتبط</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العرض المرتبط" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {promotions.map((promotion) => (
                    <SelectItem key={promotion.id} value={promotion.id.toString()}>
                      {promotion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="usageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>حد الاستخدام</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                عدد المرات المسموح باستخدام الكود
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الانتهاء</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </DialogClose>
          <Button type="submit">إضافة</Button>
        </div>
      </form>
    </Form>
  );
}