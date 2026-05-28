/**
 * Generic localStorage CRUD layer.
 * All app data lives here — no server required.
 */

export type StoreKey =
  | "acadash_subjects"
  | "acadash_tasks"
  | "acadash_events"
  | "acadash_classes";

export function lsGet<T>(key: StoreKey): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function lsSet<T>(key: StoreKey, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Returns the next auto-increment id for a collection. */
export function lsNextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}
