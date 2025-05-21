import { useState, useRef, useEffect } from "react";
import { useSlides } from "@/hooks/use-pptx";
import { FaGripLinesVertical } from "react-icons/fa";

interface SlideThumbnailsProps {
  commitId: number;
  activeSlideId?: number;
  onSelectSlide: (slideId: number) => void;
}

export default function SlideThumbnails({ commitId, activeSlideId, onSelectSlide }: SlideThumbnailsProps) {
  const { data: slides, isLoading } = useSlides(commitId);
  const [width, setWidth] = useState(256); // Default width in pixels (w-64 = 16rem = 256px)
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const minWidth = 200; // Minimum width in pixels
  const maxWidth = 500; // Maximum width in pixels
  
  // Setup mouse event handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // 画面の左端からパネル右端までの距離を計算
      const panelRect = resizeRef.current?.getBoundingClientRect();
      if (!panelRect) return;
      
      // パネルの左端位置（固定）
      const panelLeft = panelRect.left - (width - panelRect.width);
      // 新しいパネル幅 = マウスX座標 - パネル左端位置
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - panelLeft));
      
      setWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  const startResize = () => {
    setIsResizing(true);
  };
  
  if (isLoading) {
    return (
      <div style={{ width: `${width}px` }} className="relative flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold mb-4">Slides</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-md aspect-w-16 aspect-h-9 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width: `${width}px` }} ref={resizeRef} className="relative flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
      <div className="absolute top-0 right-0 bottom-0 w-1 bg-transparent cursor-ew-resize z-10" 
           onMouseDown={startResize}
           title="Resize panel"
           style={{ touchAction: 'none' }}>
        <div className="absolute top-1/2 right-0 -mt-6 bg-gray-200 dark:bg-gray-600 rounded-l-md px-0.5 py-3 flex items-center justify-center shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
          <FaGripLinesVertical className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      <h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-200">Slides</h3>
      <div className="space-y-4">
        {slides?.map((slide) => (
          <div 
            key={slide.id}
            className={`slide-thumbnail bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${slide.id === activeSlideId ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg' : 'border border-gray-200 dark:border-gray-600'}`}
            onClick={() => onSelectSlide(slide.id)}
          >
            <div className="relative" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
              <div className="absolute inset-0">
                {/* Slide preview content based on slide type */}
                {slide.slideNumber === 1 && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-3 bg-white dark:bg-gray-800">
                    <div className="w-12 h-2.5 bg-blue-500 dark:bg-blue-400 mb-2 rounded-sm"></div>
                    <div className="w-20 h-1.5 bg-gray-300 dark:bg-gray-500 mb-1.5 rounded-sm"></div>
                    <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-500 rounded-sm"></div>
                  </div>
                )}
                
                {slide.slideNumber === 2 && (
                  <div className="absolute inset-0 flex flex-col p-3 bg-white dark:bg-gray-800">
                    <div className="w-20 h-2 bg-gray-300 dark:bg-gray-500 mb-2 rounded-sm"></div>
                    <div className="flex items-center mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                      <div className="w-16 h-1 bg-gray-300 dark:bg-gray-500 rounded-sm"></div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                      <div className="w-14 h-1 bg-gray-300 dark:bg-gray-500 rounded-sm"></div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                      <div className="w-18 h-1 bg-gray-300 dark:bg-gray-500 rounded-sm"></div>
                    </div>
                  </div>
                )}
                
                {slide.slideNumber === 3 && (
                  <div className="absolute inset-0 flex flex-col p-3 bg-white dark:bg-gray-800">
                    <div className="w-16 h-2 bg-gray-300 dark:bg-gray-500 mb-2 rounded-sm"></div>
                    <div className="flex justify-center items-end grow py-2">
                      <div className="w-3 h-6 bg-blue-300 dark:bg-blue-700 mr-1 rounded-t-sm"></div>
                      <div className="w-3 h-10 bg-blue-400 dark:bg-blue-600 mr-1 rounded-t-sm"></div>
                      <div className="w-3 h-8 bg-blue-500 mr-1 rounded-t-sm"></div>
                      <div className="w-3 h-12 bg-blue-600 dark:bg-blue-400 rounded-t-sm"></div>
                    </div>
                  </div>
                )}
                
                {slide.slideNumber === 4 && (
                  <div className="absolute inset-0 flex flex-col p-3 bg-white dark:bg-gray-800">
                    <div className="w-16 h-2 bg-gray-300 dark:bg-gray-500 mb-2 rounded-sm"></div>
                    <div className="grow flex items-center justify-center m-1.5">
                      <div className="w-3/4 h-3/4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2.5 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Slide {slide.slideNumber}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{slide.title || `Untitled Slide`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
