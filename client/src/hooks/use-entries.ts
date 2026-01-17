import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertEntry } from "@shared/schema";

export function useEntries() {
  return useQuery({
    queryKey: [api.entries.list.path],
    queryFn: async () => {
      const res = await fetch(api.entries.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch entries");
      return api.entries.list.responses[200].parse(await res.json());
    },
  });
}

export function useEntry(id: number) {
  return useQuery({
    queryKey: [api.entries.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.entries.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch entry");
      return api.entries.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEntry & { tags?: string[]; projectIds?: number[] }) => {
      const validated = api.entries.create.input.parse(data);
      const res = await fetch(api.entries.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create entry");
      }
      return api.entries.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entries.list.path] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertEntry> & { tags?: string[]; projectIds?: number[] }) => {
      const validated = api.entries.update.input.parse(updates);
      const url = buildUrl(api.entries.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update entry");
      return api.entries.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entries.list.path] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.entries.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete entry");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.entries.list.path] });
    },
  });
}
