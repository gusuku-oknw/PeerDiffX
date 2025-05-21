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
  const { data: branches } = useBranches(presentationId);
  
  return useQuery<Branch>({ 
    queryKey: [branchId ? `/api/branches/${branchId}` : `/api/presentations/${presentationId}/default-branch`],
    enabled: (!!branchId || (!!presentationId && isDefault === true)),
    // If branch ID is provided, fetch specific branch, otherwise use branches data to find default
    queryFn: async () => {
      if (branchId) {
        const res = await fetch(`/api/branches/${branchId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch branch");
        return res.json();
      } else if (branches) {
        // Find default branch from already fetched branches
        const defaultBranch = branches.find(branch => branch.isDefault);
        if (defaultBranch) return defaultBranch;
        // If no default branch found, return first branch
        return branches[0];
      }
      throw new Error("No branches found");
    },
  });
}
