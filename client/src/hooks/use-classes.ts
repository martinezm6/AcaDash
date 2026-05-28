import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Class, type InsertClass } from "@shared/schema";
import { lsGet, lsSet, lsNextId } from "@/lib/local-store";

const KEY = "acadash_classes" as const;
const QK = ["/api/classes"];

export function useClasses() {
  return useQuery({
    queryKey: QK,
    queryFn: () => lsGet<Class>(KEY),
    staleTime: Infinity,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertClass) => {
      const items = lsGet<Class>(KEY);
      const item = { ...data, id: lsNextId(items) } as Class;
      lsSet(KEY, [...items, item]);
      return item;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      lsSet(KEY, lsGet<Class>(KEY).filter((c) => c.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
