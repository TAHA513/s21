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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertProductSchema, type Product, type ProductGroup } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Scan } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  groups: ProductGroup[];
  onSuccess?: () => void;
}

export function ProductForm({ product, groups, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      barcode: product?.barcode ?? "",
      type: product?.type ?? "piece",
      quantity: product?.quantity?.toString() ?? "0",
      costPrice: product?.costPrice?.toString() ?? "0",
      sellingPrice: product?.sellingPrice?.toString() ?? "0",
      groupId: product?.groupId ?? groups[0]?.id ?? 0,
      isWeighted: product?.isWeighted ?? false,
      status: product?.status ?? "active",
      productionDate: product?.productionDate ? new Date(product.productionDate).toISOString().split('T')[0] : "",
      expiryDate: product?.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
    },
  });

  const productMutation = useMutation({
    mutationFn: async (values: any) => {
      try {
        // تحويل القيم النصية إلى أرقام وتنسيق البيانات
        const formattedData = {
          ...values,
          quantity: Number(values.quantity),
          costPrice: Number(values.costPrice),
          sellingPrice: Number(values.sellingPrice),
          groupId: Number(values.groupId),
          // تنسيق التواريخ
          productionDate: values.productionDate ? new Date(values.productionDate).toISOString() : null,
          expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : null,
        };

        if (product) {
          const response = await apiRequest("PATCH", `/api/products/${product.id}`, formattedData);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return data;
        } else {
          const response = await apiRequest("POST", "/api/products", formattedData);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error("Error in product mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: product ? "تم تحديث المنتج" : "تم إضافة المنتج",
        description: product ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح",
      });
      onSuccess?.();
      form.reset();
    },
    onError: (error: any) => {
      console.error("Product mutation error:", error);
      toast({
        title: "خطأ في " + (product ? "تحديث" : "إضافة") + " المنتج",
        description: error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const groupMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/product-groups", {
        name,
        description: "",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-groups"] });
      form.setValue("groupId", newGroup.id);
      setIsNewGroup(false);
      setNewGroupName("");
      toast({
        title: "تم إنشاء المجموعة",
        description: "تم إنشاء المجموعة الجديدة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء المجموعة",
        description: error.message || "حدث خطأ أثناء إنشاء المجموعة الجديدة",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: any) {
    try {
      if (isNewGroup && newGroupName) {
        const newGroup = await groupMutation.mutateAsync(newGroupName);
        data.groupId = newGroup.id;
      }
      await productMutation.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المنتج</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الباركود</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <Scan className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>مسح الباركود</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">جاري تطوير ميزة مسح الباركود...</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع المنتج</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المنتج" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="piece">قطعة</SelectItem>
                    <SelectItem value="weight">وزن</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الكمية</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سعر التكلفة</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سعر البيع</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isNewGroup ? (
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المجموعة</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مجموعة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 mt-1">
                    <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setIsNewGroup(true)}>
                      إنشاء مجموعة جديدة
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormItem>
              <FormLabel>اسم المجموعة الجديدة</FormLabel>
              <div className="flex gap-2">
                <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                <Button type="button" variant="outline" onClick={() => setIsNewGroup(false)}>
                  إلغاء
                </Button>
              </div>
            </FormItem>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="productionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الإنتاج</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الانتهاء</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isWeighted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>منتج وزني</FormLabel>
                <FormDescription>
                  تفعيل القراءة المباشرة للوزن عند المسح
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button 
            type="submit" 
            disabled={productMutation.isPending || groupMutation.isPending}
          >
            {productMutation.isPending || groupMutation.isPending ? 
              "جاري الحفظ..." : 
              product ? "تحديث المنتج" : "إضافة المنتج"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}