import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGenerateSummary() {
  return useMutation({
    mutationFn: async (timeRange: 'daily' | 'weekly') => {
      const res = await fetch(api.ai.generateSummary.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeRange }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to generate summary");
      return api.ai.generateSummary.responses[200].parse(await res.json());
    },
  });
}

export function useSuggestNextSteps() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.ai.suggestNextSteps.path, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to get suggestions");
      return api.ai.suggestNextSteps.responses[200].parse(await res.json());
    },
  });
}
