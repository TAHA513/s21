import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoreSettings, setStoreSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { StoreSettings } from "@/types";

export function useStoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storeSettings } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<StoreSettings>) => setStoreSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات المتجر بنجاح",
      });
    },
  });

  const updateStoreSettings = (data: Partial<StoreSettings>) => {
    mutation.mutate(data);
  };

  return {
    storeSettings,
    updateStoreSettings,
    isLoading: mutation.isPending,
  };
}
