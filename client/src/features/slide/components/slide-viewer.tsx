// 統合されたスライドビューアーコンポーネント
import React from 'react';
import { Button } from '@/shared/ui';
import { FaSearchMinus, FaSearchPlus, FaExpand, FaCompress } from 'react-icons/fa';
import { useSlideState } from '../hooks/use-slide-state';
import type { Slide } from '@shared/schema';

interface SlideViewerProps {
  slide: Slide;
  onZoomChange?: (level: number) => void;
  onFullscreenToggle?: () => void;
  className?: string;
}

export function SlideViewer({ 
  slide, 
  onZoomChange, 
  onFullscreenToggle,
  className = '' 
}: SlideViewerProps) {
  const { viewState, setZoomLevel, toggleFullscreen } = useSlideState();

  const handleZoomIn = () => {
    const newLevel = viewState.zoomLevel + 25;
    setZoomLevel(newLevel);
    onZoomChange?.(newLevel);
  };

  const handleZoomOut = () => {
    const newLevel = viewState.zoomLevel - 25;
    setZoomLevel(newLevel);
    onZoomChange?.(newLevel);
  };

  const handleFullscreenToggle = () => {
    toggleFullscreen();
    onFullscreenToggle?.();
  };

  const renderSlideContent = () => {
    if (!slide.content || typeof slide.content !== 'object') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">スライドコンテンツがありません</p>
        </div>
      );
    }

    const content = slide.content as any;
    
    if (content.elements && Array.isArray(content.elements)) {
      return (
        <div className="relative w-full h-full">
          <h2 className="text-3xl font-bold mb-4">{slide.title || 'タイトルなし'}</h2>
          {content.elements.map((element: any, idx: number) => {
            if (element.type === 'text') {
              return (
                <p
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    color: element.style?.color || '#000',
                    fontSize: `${element.style?.fontSize || 16}px`,
                    fontWeight: element.style?.fontWeight || 'normal',
                  }}
                >
                  {element.content}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // デフォルト表示
    return (
      <div className="p-8 h-full relative flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6 text-center">{slide.title || 'スライド'}</h1>
        <div className="w-20 h-1 bg-blue-500 mb-8"></div>
        <p className="text-xl text-gray-600 dark:text-gray-300 text-center">
          スライド番号: {slide.slideNumber}
        </p>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* ズームコントロールバー */}
      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={handleZoomOut}>
            <FaSearchMinus className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {viewState.zoomLevel}%
          </span>
          <Button size="sm" variant="ghost" onClick={handleZoomIn}>
            <FaSearchPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <Button size="sm" variant="ghost" onClick={handleFullscreenToggle}>
          {viewState.isFullscreen ? (
            <FaCompress className="h-3.5 w-3.5" />
          ) : (
            <FaExpand className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* スライドコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div
          className={`bg-white dark:bg-gray-800 shadow-lg rounded-sm ${
            viewState.aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'
          } w-full max-w-4xl`}
          style={{
            transform: `scale(${viewState.zoomLevel / 100})`,
            transformOrigin: 'center',
          }}
        >
          {renderSlideContent()}
        </div>
      </div>
    </div>
  );
}