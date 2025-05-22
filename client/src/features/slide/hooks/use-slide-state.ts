// スライド状態管理フック
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slideService } from '../api/slide-service';
import type { SlideViewState } from '@/shared/types';

export function useSlideState(initialSlideId?: number) {
  const [viewState, setViewState] = useState<SlideViewState>({
    currentSlideId: initialSlideId || null,
    currentSlideIndex: 0,
    zoomLevel: 100,
    aspectRatio: '16:9',
    isFullscreen: false,
  });

  const updateViewState = useCallback((updates: Partial<SlideViewState>) => {
    setViewState(prev => ({ ...prev, ...updates }));
  }, []);

  const setCurrentSlide = useCallback((slideId: number, index: number) => {
    updateViewState({
      currentSlideId: slideId,
      currentSlideIndex: index,
    });
  }, [updateViewState]);

  const setZoomLevel = useCallback((level: number) => {
    updateViewState({ zoomLevel: Math.max(25, Math.min(400, level)) });
  }, [updateViewState]);

  const toggleFullscreen = useCallback(() => {
    updateViewState({ isFullscreen: !viewState.isFullscreen });
  }, [viewState.isFullscreen, updateViewState]);

  const setAspectRatio = useCallback((ratio: '16:9' | '4:3') => {
    updateViewState({ aspectRatio: ratio });
  }, [updateViewState]);

  return {
    viewState,
    setCurrentSlide,
    setZoomLevel,
    toggleFullscreen,
    setAspectRatio,
    updateViewState,
  };
}

export function useSlides(commitId: number) {
  return useQuery({
    queryKey: ['slides', commitId],
    queryFn: () => slideService.getByCommitId(commitId),
    enabled: !!commitId,
  });
}

export function useSlide(slideId: number) {
  return useQuery({
    queryKey: ['slide', slideId],
    queryFn: () => slideService.getById(slideId),
    enabled: !!slideId,
  });
}

export function useSlideActions() {
  const queryClient = useQueryClient();

  const createSlide = useMutation({
    mutationFn: slideService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
    },
  });

  const updateSlide = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      slideService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      queryClient.invalidateQueries({ queryKey: ['slide'] });
    },
  });

  const deleteSlide = useMutation({
    mutationFn: slideService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
    },
  });

  return {
    createSlide,
    updateSlide,
    deleteSlide,
  };
}