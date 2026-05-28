import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Event, type InsertEvent } from "@shared/schema";
import { lsGet, lsSet, lsNextId } from "@/lib/local-store";

const KEY = "acadash_events" as const;
const QK = ["/api/events"];

export function useEvents() {
  return useQuery({
    queryKey: QK,
    queryFn: () => lsGet<Event>(KEY),
    staleTime: Infinity,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEvent) => {
      const items = lsGet<Event>(KEY);
      const item = { ...data, id: lsNextId(items) } as Event;
      lsSet(KEY, [...items, item]);
      return item;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      lsSet(KEY, lsGet<Event>(KEY).filter((e) => e.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
