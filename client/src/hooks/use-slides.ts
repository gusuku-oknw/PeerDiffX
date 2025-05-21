import { useQuery } from "@tanstack/react-query";
import { Slide } from "@shared/schema";

/**
 * Hook to fetch all slides for a commit
 */
export function useSlides(commitId?: number) {
  return useQuery<Slide[]>({ 
    queryKey: [`/api/commits/${commitId}/slides`],
    enabled: !!commitId,
    queryFn: async () => {
      if (!commitId) return [];
      
      try {
        const response = await fetch(`/api/commits/${commitId}/slides`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          // APIエラーの場合は空配列を返す
          if (response.status === 404) {
            console.log("スライドが見つかりません。空配列を返します。");
            return [];
          }
          
          throw new Error(`Failed to fetch slides: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("スライド取得エラー:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 10000
  });
}

/**
 * Hook to fetch a specific slide
 */
export function useSlide(slideId?: number) {
  return useQuery<Slide>({ 
    queryKey: [`/api/slides/${slideId}`],
    enabled: !!slideId,
    queryFn: async () => {
      if (!slideId) throw new Error("Slide ID is required");
      
      const response = await fetch(`/api/slides/${slideId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch slide");
      return await response.json();
    },
    retry: 2
  });
}