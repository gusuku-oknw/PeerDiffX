import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export interface SlideCanvasState {
  zoomLevel: number;
  aspectRatio: '16:9' | '4:3';
  isFullscreen: boolean;
  showBottomPanel: boolean;
  activeTab: 'comments' | 'history' | 'locks' | 'ai';
  panelHeight: number;
}

export function useSlideCanvasHandlers() {
  const [presentationSettings] = useLocalStorage('presentation_settings', {
    defaultAspectRatio: '16:9',
    defaultZoomLevel: 100
  });
  
  const [zoomLevel, setZoomLevel] = useState(presentationSettings.defaultZoomLevel);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>(
    presentationSettings.defaultAspectRatio as '16:9' | '4:3'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'locks' | 'ai'>('comments');
  const [panelHeight, setPanelHeight] = useState(240);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleBottomPanel = useCallback(() => {
    setShowBottomPanel(prev => !prev);
  }, []);

  const toggleAspectRatio = useCallback(() => {
    setAspectRatio(prev => prev === '16:9' ? '4:3' : '16:9');
  }, []);

  const handleTabChange = useCallback((tab: 'comments' | 'history' | 'locks' | 'ai') => {
    setActiveTab(tab);
    if (!showBottomPanel) {
      setShowBottomPanel(true);
    }
  }, [showBottomPanel]);

  return {
    state: {
      zoomLevel,
      aspectRatio,
      isFullscreen,
      showBottomPanel,
      activeTab,
      panelHeight,
    },
    handlers: {
      handleZoomIn,
      handleZoomOut,
      toggleFullscreen,
      toggleBottomPanel,
      toggleAspectRatio,
      handleTabChange,
      setZoomLevel,
      setAspectRatio,
      setIsFullscreen,
      setShowBottomPanel,
      setActiveTab,
      setPanelHeight,
    }
  };
}