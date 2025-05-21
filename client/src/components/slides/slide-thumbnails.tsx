import { useState } from "react";
import { useSlides } from "@/hooks/use-pptx";

interface SlideThumbnailsProps {
  commitId: number;
  activeSlideId?: number;
  onSelectSlide: (slideId: number) => void;
}

export default function SlideThumbnails({ commitId, activeSlideId, onSelectSlide }: SlideThumbnailsProps) {
  const { data: slides, isLoading } = useSlides(commitId);
  
  if (isLoading) {
    return (
      <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
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
    <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
      <h3 className="text-sm font-semibold mb-4">Slides</h3>
      <div className="space-y-3">
        {slides?.map((slide) => (
          <div 
            key={slide.id}
            className={`slide-thumbnail bg-white dark:bg-gray-700 rounded-md shadow-sm overflow-hidden cursor-pointer ${slide.id === activeSlideId ? 'border-2 border-blue-500 dark:border-blue-400' : ''}`}
            onClick={() => onSelectSlide(slide.id)}
          >
            <div className="aspect-w-16 aspect-h-9 relative">
              {/* Slide preview content based on slide type */}
              {slide.slideNumber === 1 && (
                <div className="absolute inset-0 flex flex-col justify-center items-center p-2">
                  <div className="w-10 h-2 bg-blue-500 mb-1"></div>
                  <div className="w-16 h-1 bg-gray-300 dark:bg-gray-500 mb-0.5"></div>
                  <div className="w-14 h-1 bg-gray-300 dark:bg-gray-500"></div>
                </div>
              )}
              
              {slide.slideNumber === 2 && (
                <div className="absolute inset-0 flex flex-col p-2">
                  <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-500 mb-1"></div>
                  <div className="flex items-start mt-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400 mt-0.5 mr-1"></div>
                    <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-500"></div>
                  </div>
                  <div className="flex items-start mt-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400 mt-0.5 mr-1"></div>
                    <div className="w-10 h-0.5 bg-gray-300 dark:bg-gray-500"></div>
                  </div>
                  <div className="flex items-start mt-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400 mt-0.5 mr-1"></div>
                    <div className="w-14 h-0.5 bg-gray-300 dark:bg-gray-500"></div>
                  </div>
                </div>
              )}
              
              {slide.slideNumber === 3 && (
                <div className="absolute inset-0 flex flex-col p-2">
                  <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-500 mb-1"></div>
                  <div className="flex justify-center items-end grow p-1">
                    <div className="w-2 h-4 bg-blue-300 dark:bg-blue-700 mr-0.5"></div>
                    <div className="w-2 h-6 bg-blue-400 dark:bg-blue-600 mr-0.5"></div>
                    <div className="w-2 h-5 bg-blue-500 dark:bg-blue-500 mr-0.5"></div>
                    <div className="w-2 h-7 bg-blue-600 dark:bg-blue-400"></div>
                  </div>
                </div>
              )}
              
              {slide.slideNumber === 4 && (
                <div className="absolute inset-0 flex flex-col p-2">
                  <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-500 mb-1"></div>
                  <div className="grow bg-gray-200 dark:bg-gray-600 m-1 rounded-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs font-medium">Slide {slide.slideNumber}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{slide.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
