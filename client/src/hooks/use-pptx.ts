import { useQuery } from "@tanstack/react-query";
import { Presentation, Commit, Slide } from "@shared/schema";

/**
 * Hook to fetch all presentations
 */
export function usePresentations() {
  return useQuery<Presentation[]>({ 
    queryKey: ["/api/presentations"],
  });
}

/**
 * Hook to fetch a specific presentation
 */
export function usePresentation(presentationId: number) {
  return useQuery<Presentation>({ 
    queryKey: [`/api/presentations/${presentationId}`],
    enabled: !!presentationId,
  });
}

/**
 * Hook to fetch commits for a branch
 */
export function useCommits(branchId?: number) {
  return useQuery<Commit[]>({ 
    queryKey: [`/api/branches/${branchId}/commits`],
    enabled: !!branchId,
  });
}

/**
 * Hook to fetch a specific commit
 */
export function useCommit(commitId: number) {
  return useQuery<Commit>({ 
    queryKey: [`/api/commits/${commitId}`],
    enabled: !!commitId,
  });
}

/**
 * Hook to fetch slides for a commit
 */
export function useSlides(commitId?: number) {
  return useQuery<Slide[]>({
    queryKey: ['/api/commits', commitId, 'slides'],
    enabled: !!commitId,
    staleTime: 30000, // 30秒間はデータを新鮮と見なす
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に自動的に再取得しない
    refetchOnMount: true, // コンポーネントがマウントされたときに再取得する
    retry: 3, // 失敗時に3回まで再試行
  });
}

/**
 * Hook to fetch a specific slide
 */
export function useSlide(slideId: number) {
  return useQuery<Slide>({ 
    queryKey: [`/api/slides/${slideId}`],
    enabled: !!slideId,
  });
}

/**
 * Hook to fetch diffs for a commit
 */
export function useDiffs(commitId?: number) {
  return useQuery({ 
    queryKey: [`/api/commits/${commitId}/diffs`],
    enabled: !!commitId,
  });
}

/**
 * Hook to fetch a specific diff
 */
export function useDiff(diffId: number) {
  return useQuery({ 
    queryKey: [`/api/diffs/${diffId}`],
    enabled: !!diffId,
  });
}

/**
 * Hook to compare two commits
 */
export function useCommitComparison(baseCommitId: number, compareCommitId: number) {
  return useQuery({ 
    queryKey: [`/api/compare/${baseCommitId}/${compareCommitId}`],
    enabled: !!baseCommitId && !!compareCommitId,
  });
}
