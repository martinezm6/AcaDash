import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Task, type InsertTask } from "@shared/schema";
import { lsGet, lsSet, lsNextId } from "@/lib/local-store";

const KEY = "acadash_tasks" as const;
const QK = ["/api/tasks"];

export function useTasks() {
  return useQuery({
    queryKey: QK,
    queryFn: () => lsGet<Task>(KEY),
    staleTime: Infinity,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTask) => {
      const items = lsGet<Task>(KEY);
      const item = { ...data, id: lsNextId(items) } as Task;
      lsSet(KEY, [...items, item]);
      return item;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTask>) => {
      const items = lsGet<Task>(KEY);
      const updated = items.map((t) => (t.id === id ? { ...t, ...updates } : t));
      lsSet(KEY, updated);
      return updated.find((t) => t.id === id)!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      lsSet(KEY, lsGet<Task>(KEY).filter((t) => t.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
