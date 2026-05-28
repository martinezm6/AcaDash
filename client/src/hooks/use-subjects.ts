import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertSubject, type Subject } from "@shared/schema";

export function useSubjects() {
  return useQuery({
    queryKey: [api.subjects.list.path],
    queryFn: async () => {
      const res = await fetch(api.subjects.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data = await res.json();
      return data as Subject[]; // In production, we'd use z.parse
    },
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSubject) => {
      const res = await fetch(api.subjects.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create subject");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] }),
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertSubject>) => {
      const url = buildUrl(api.subjects.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update subject");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] }),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.subjects.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete subject");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] }),
  });
}
