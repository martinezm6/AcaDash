import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertClass, type Class } from "@shared/schema";

export function useClasses() {
  return useQuery({
    queryKey: [api.classes.list.path],
    queryFn: async () => {
      const res = await fetch(api.classes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      return data as Class[];
    },
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertClass) => {
      const res = await fetch(api.classes.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create class");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.classes.list.path] }),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.classes.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete class");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.classes.list.path] }),
  });
}
