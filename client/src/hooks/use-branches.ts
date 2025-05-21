import { useQuery } from "@tanstack/react-query";
import { Branch } from "@shared/schema";

/**
 * Hook to fetch all branches for a presentation
 */
export function useBranches(presentationId?: number) {
  return useQuery<Branch[]>({ 
    queryKey: [`/api/presentations/${presentationId}/branches`],
    enabled: !!presentationId,
  });
}

/**
 * Hook to fetch a specific branch
 * @param presentationId - Presentation ID (for refetching branches)
 * @param isDefault - Whether to fetch the default branch
 * @param branchId - Specific branch ID to fetch (overrides isDefault)
 */
export function useBranch(presentationId: number, isDefault?: boolean, branchId?: number) {
  const { data: branches, isSuccess: branchesLoaded } = useBranches(presentationId);
  
  return useQuery<Branch>({ 
    queryKey: [`branch-${presentationId}-${branchId || 'default'}`],
    enabled: !!presentationId && (!!branchId || isDefault === true),
    // If branch ID is provided, fetch specific branch, otherwise use branches data to find default
    queryFn: async () => {
      if (branchId) {
        const res = await fetch(`/api/branches/${branchId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch branch");
        return res.json();
      } else if (branchesLoaded && branches && branches.length > 0) {
        // Find default branch from already fetched branches
        const defaultBranch = branches.find(branch => branch.isDefault);
        if (defaultBranch) return defaultBranch;
        // If no default branch found, return first branch
        return branches[0];
      } else if (branchesLoaded && (!branches || branches.length === 0)) {
        // No branches found for this presentation, return empty placeholder
        return null;
      }
      
      // fallback - attempt direct API call to get branches
      const res = await fetch(`/api/presentations/${presentationId}/branches`, {
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to fetch branches");
      
      const fetchedBranches = await res.json();
      if (fetchedBranches && fetchedBranches.length > 0) {
        const defaultBranch = fetchedBranches.find((branch: Branch) => branch.isDefault);
        if (defaultBranch) return defaultBranch;
        return fetchedBranches[0];
      }
      
      throw new Error("No branches found");
    },
  });
}
