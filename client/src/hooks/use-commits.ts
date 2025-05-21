import { useQuery } from "@tanstack/react-query";
import { Commit } from "@shared/schema";

/**
 * Hook to fetch all commits for a branch
 */
export function useCommits(branchId?: number) {
  return useQuery<Commit[]>({ 
    queryKey: [`/api/branches/${branchId}/commits`],
    enabled: !!branchId,
    queryFn: async () => {
      if (!branchId) throw new Error("Branch ID is required");
      
      try {
        const response = await fetch(`/api/branches/${branchId}/commits`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          // ブランチはあるがコミットがない場合は空配列を返す
          if (response.status === 404) {
            console.log("コミットが見つかりません。空配列を返します。");
            return [];
          }
          
          throw new Error("Failed to fetch commits");
        }
        
        return await response.json();
      } catch (error) {
        console.error("コミット取得エラー:", error);
        return [];
      }
    },
  });
}

/**
 * Hook to fetch the latest commit for a branch
 * @param branchId - Branch ID 
 */
export function useLatestCommit(branchId?: number) {
  const { data: commits, isLoading, isError } = useCommits(branchId);
  
  return useQuery<Commit>({ 
    queryKey: [`/api/branches/${branchId}/latest-commit`],
    enabled: !!branchId,
    queryFn: async () => {
      if (!branchId) throw new Error("Branch ID is required");
      
      // Use commits data if available
      if (commits && commits.length > 0) {
        // Sort by creation date (descending)
        const sortedCommits = [...commits].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sortedCommits[0];
      }
      
      // Fetch directly if commits data is not available
      const res = await fetch(`/api/branches/${branchId}/commits`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch commits");
      const fetchedCommits = await res.json();
      
      if (fetchedCommits.length === 0) {
        throw new Error("No commits found for this branch");
      }
      
      // Sort by creation date (descending)
      const sortedCommits = fetchedCommits.sort((a: Commit, b: Commit) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return sortedCommits[0];
    },
    retry: false
  });
}

/**
 * Hook to fetch a specific commit
 */
export function useCommit(commitId?: number) {
  return useQuery<Commit>({ 
    queryKey: [`/api/commits/${commitId}`],
    enabled: !!commitId,
  });
}