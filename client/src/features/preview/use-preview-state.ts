import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Presentation, Slide, Commit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PreviewState {
  presentation?: Presentation;
  commit?: Commit;
  slides: Slide[];
  activeSlideId?: number;
  activeSlide?: Slide;
  isLoading: boolean;
  error: Error | null;
  handleSelectSlide: (slideId: number) => void;
  handlePrevSlide: () => void;
  handleNextSlide: () => void;
}

/**
 * Custom hook to manage the state for presentation preview
 * Handles loading, error states, and slide navigation
 */
export function usePreviewState(presentationId: number, commitId?: number): PreviewState {
  const { toast } = useToast();
  const [activeSlideId, setActiveSlideId] = useState<number | undefined>(undefined);
  
  // Query to fetch presentation details
  const {
    data: presentation,
    isLoading: isLoadingPresentation,
    error: presentationError
  } = useQuery({
    queryKey: ['/api/presentations', presentationId],
    enabled: !!presentationId,
    retry: 1,
    staleTime: 60000, // 1 minute
  });
  
  // Query to fetch the target commit (latest if not specified)
  const {
    data: commit,
    isLoading: isLoadingCommit,
    error: commitError
  } = useQuery({
    queryKey: ['/api/commits', commitId, presentationId],
    queryFn: async () => {
      if (commitId) {
        const response = await fetch(`/api/commits/${commitId}`);
        if (!response.ok) throw new Error('Failed to fetch commit');
        return response.json();
      } else {
        // Get default branch's latest commit
        const branchResponse = await fetch(`/api/presentations/${presentationId}/branches`);
        if (!branchResponse.ok) throw new Error('Failed to fetch branches');
        
        const branches = await branchResponse.json();
        const defaultBranch = branches.find((b: any) => b.isDefault) || branches[0];
        
        if (!defaultBranch) throw new Error('No branches found');
        
        const commitResponse = await fetch(`/api/branches/${defaultBranch.id}/commits`);
        if (!commitResponse.ok) throw new Error('Failed to fetch commits');
        
        const commits = await commitResponse.json();
        return commits[0]; // Latest commit
      }
    },
    enabled: !!presentationId,
    retry: 1
  });
  
  // Query to fetch slides for the active commit
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError
  } = useQuery({
    queryKey: ['/api/slides', commit?.id],
    queryFn: async () => {
      if (!commit?.id) return [];
      const response = await fetch(`/api/commits/${commit.id}/slides`);
      if (!response.ok) throw new Error('Failed to fetch slides');
      return response.json();
    },
    enabled: !!commit?.id,
    retry: 1
  });
  
  // Set the active slide when slides are loaded
  useEffect(() => {
    if (slides.length > 0 && !activeSlideId) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);
  
  // Get the active slide object
  const activeSlide = slides.find(slide => slide.id === activeSlideId);
  
  // Slide navigation handlers
  const handleSelectSlide = (slideId: number) => {
    setActiveSlideId(slideId);
  };
  
  const handlePrevSlide = () => {
    if (!activeSlide || !slides.length) return;
    
    const currentIndex = slides.findIndex(slide => slide.id === activeSlideId);
    if (currentIndex > 0) {
      setActiveSlideId(slides[currentIndex - 1].id);
    }
  };
  
  const handleNextSlide = () => {
    if (!activeSlide || !slides.length) return;
    
    const currentIndex = slides.findIndex(slide => slide.id === activeSlideId);
    if (currentIndex < slides.length - 1) {
      setActiveSlideId(slides[currentIndex + 1].id);
    }
  };
  
  // Combine all loading states
  const isLoading = isLoadingPresentation || isLoadingCommit || isLoadingSlides;
  
  // Combine all errors
  const error = presentationError || commitError || slidesError || null;
  
  return {
    presentation,
    commit,
    slides,
    activeSlideId,
    activeSlide,
    isLoading,
    error,
    handleSelectSlide,
    handlePrevSlide,
    handleNextSlide
  };
}