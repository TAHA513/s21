import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";

type AppointmentFormData = z.infer<typeof insertAppointmentSchema>;

export function AppointmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      customerId: 1, // Temporary default value
      staffId: 1, // Temporary default value
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      status: "pending",
      notes: ""
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      // Convert date strings to Date objects
      const formattedData = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      };
      return apiRequest("POST", "/api/appointments", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الموعد بنجاح",
      });

      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الموعد",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وقت الموعد</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وقت انتهاء الموعد</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل أي ملاحظات إضافية" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "جاري الإضافة..." : "إضافة موعد"}
        </Button>
      </form>
    </Form>
  );
}