import { useQuery } from "@tanstack/react-query";
import { Commit, Slide } from "@shared/schema";

/**
 * Custom hook to fetch version history for a specific slide
 * This combines information from commits and diffs to provide a comprehensive history
 */
export function useVersionHistory(slideId?: number) {
  return useQuery<Commit[]>({ 
    queryKey: [`/api/version-history/slide/${slideId}`],
    enabled: !!slideId,
    queryFn: async () => {
      // In a real implementation, this would call a specific endpoint
      // For now, we'll simulate the version history with commits
      
      // First, get the slide details to find the commit
      const slideRes = await fetch(`/api/slides/${slideId}`, {
        credentials: "include",
      });
      
      if (!slideRes.ok) throw new Error("Failed to fetch slide");
      const slide: Slide = await slideRes.json();
      
      // Then, get the commit
      const commitRes = await fetch(`/api/commits/${slide.commitId}`, {
        credentials: "include",
      });
      
      if (!commitRes.ok) throw new Error("Failed to fetch commit");
      const commit: Commit = await commitRes.json();
      
      // Get all commits for this branch
      const commitsRes = await fetch(`/api/branches/${commit.branchId}/commits`, {
        credentials: "include",
      });
      
      if (!commitsRes.ok) throw new Error("Failed to fetch commits");
      const commits: Commit[] = await commitsRes.json();
      
      // Only return the 3 most recent commits for demo purposes
      return commits.slice(0, 3);
    },
  });
}
