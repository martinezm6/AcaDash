import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Subject, type InsertSubject } from "@shared/schema";
import { lsGet, lsSet, lsNextId } from "@/lib/local-store";

const KEY = "acadash_subjects" as const;
const QK = ["/api/subjects"];

export function useSubjects() {
  return useQuery({
    queryKey: QK,
    queryFn: () => lsGet<Subject>(KEY),
    staleTime: Infinity,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSubject) => {
      const items = lsGet<Subject>(KEY);
      const item = { ...data, id: lsNextId(items) } as Subject;
      lsSet(KEY, [...items, item]);
      return item;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertSubject>) => {
      const items = lsGet<Subject>(KEY);
      const updated = items.map((s) => (s.id === id ? { ...s, ...updates } : s));
      lsSet(KEY, updated);
      return updated.find((s) => s.id === id)!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      lsSet(KEY, lsGet<Subject>(KEY).filter((s) => s.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
