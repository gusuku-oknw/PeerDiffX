import { useQuery } from "@tanstack/react-query";
import { Slide } from "@shared/schema";

/**
 * Hook to fetch all slides for a commit
 */
export function useSlides(commitId?: number) {
  return useQuery<Slide[]>({ 
    queryKey: [`/api/commits/${commitId}/slides`],
    enabled: !!commitId,
  });
}

/**
 * Hook to fetch a specific slide
 */
export function useSlide(slideId?: number) {
  return useQuery<Slide>({ 
    queryKey: [`/api/slides/${slideId}`],
    enabled: !!slideId,
  });
}