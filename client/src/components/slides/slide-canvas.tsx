import React, { useEffect, useRef, useState } from "react";
import { useSlide } from "@/hooks/use-pptx";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus, FaExpand, FaCode, FaHistory, FaDesktop, FaTv } from "react-icons/fa";

interface SlideCanvasProps {
  slideId: number;
  totalSlides: number;
  currentSlideNumber: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onViewXmlDiff: () => void;
  onViewHistory: () => void;
  versionPanelVisible?: boolean;
}

export default function SlideCanvas({
  slideId,
  totalSlides,
  currentSlideNumber,
  onPrevSlide,
  onNextSlide,
  onViewXmlDiff,
  onViewHistory,
  versionPanelVisible
}: SlideCanvasProps) {
  const { data: slide, isLoading } = useSlide(slideId);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>('16:9'); // Default to 16:9 widescreen
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  const handleFullscreen = () => {
    if (canvasRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvasRef.current.requestFullscreen();
      }
    }
  };
  
  const toggleAspectRatio = () => {
    setAspectRatio(prev => prev === '16:9' ? '4:3' : '16:9');
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
          <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-8">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 shadow-lg rounded-sm aspect-w-16 aspect-h-9 w-full max-w-4xl"></div>
        </div>
      </div>
    );
  }
  
  // Mock rendering based on slide number
  const renderSlideContent = () => {
    if (currentSlideNumber === 1) {
      return (
        <div className="p-12 flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold mb-6 text-center">Q4 Presentation</h1>
          <div className="w-20 h-1 bg-blue-500 mb-8"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center">Company Overview and Results</p>
          <div className="mt-12 text-sm text-gray-500">December 15, 2023</div>
        </div>
      );
    } else if (currentSlideNumber === 2) {
      return (
        <div className="p-12 flex flex-col">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Project Overview</h2>
          <ul className="space-y-6 text-xl">
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-2 mr-4"></span>
              <span>XML-level diff extraction from PPTX files</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-2 mr-4"></span>
              <span>Git-like branch and merge management</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-2 mr-4"></span>
              <span>Browser-based instant preview</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mt-2 mr-4"></span>
              <span className="text-red-500">API integration for advanced features</span>
            </li>
          </ul>
          <div className="absolute bottom-8 right-8 flex items-center text-sm text-gray-500">
            <span className="mr-2">Last edited: 10min ago</span>
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-semibold">
              JD
            </div>
          </div>
        </div>
      );
    } else if (currentSlideNumber === 3) {
      return (
        <div className="p-12 flex flex-col">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Implementation Progress</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-end h-64 space-x-8">
              <div className="flex flex-col items-center">
                <div className="h-20 w-24 bg-blue-300 dark:bg-blue-700 rounded-t"></div>
                <div className="mt-2 text-sm">Q1</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-32 w-24 bg-blue-400 dark:bg-blue-600 rounded-t"></div>
                <div className="mt-2 text-sm">Q2</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 bg-blue-500 rounded-t"></div>
                <div className="mt-2 text-sm">Q3</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-48 w-24 bg-blue-600 dark:bg-blue-400 rounded-t"></div>
                <div className="mt-2 text-sm">Q4</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-12 flex flex-col">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Team & Resources</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-full max-w-lg">
              <div className="text-center italic text-gray-500 dark:text-gray-400">
                Image content would be displayed here
              </div>
            </div>
          </div>
          <div className="mt-8 text-xl">
            <p>Our dedicated team of engineers and designers working together to deliver this project on time.</p>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Action Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={onPrevSlide}
            disabled={currentSlideNumber === 1}
          >
            <FaArrowLeft />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={onNextSlide}
            disabled={currentSlideNumber === totalSlides}
          >
            <FaArrowRight />
          </Button>
          <span className="text-sm font-medium">Slide {currentSlideNumber}/{totalSlides}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={handleZoomOut}
          >
            <FaSearchMinus />
          </Button>
          <div className="text-sm">{zoomLevel}%</div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={handleZoomIn}
          >
            <FaSearchPlus />
          </Button>
          <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-1"></div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={toggleAspectRatio}
            title={`Change to ${aspectRatio === '16:9' ? '4:3' : '16:9'} aspect ratio`}
          >
            {aspectRatio === '16:9' ? <FaDesktop /> : <FaTv />}
          </Button>
          <div className="text-xs text-gray-500 dark:text-gray-400">{aspectRatio}</div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            onClick={handleFullscreen}
          >
            <FaExpand />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center"
            onClick={onViewXmlDiff}
          >
            <FaCode className="mr-2 text-gray-500" />
            <span>XML Diff</span>
          </Button>
          <Button 
            variant={versionPanelVisible ? "default" : "outline"}
            size="sm" 
            className={`px-3 py-1.5 rounded-md border ${versionPanelVisible ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'} text-sm flex items-center transition-colors`}
            onClick={onViewHistory}
          >
            <FaHistory className={`mr-2 ${versionPanelVisible ? 'text-white' : 'text-gray-500'}`} />
            <span>History</span>
          </Button>
          <Button className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition text-sm">
            <span>Save</span>
          </Button>
        </div>
      </div>
      
      {/* Slide Canvas */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-8">
        <div 
          ref={canvasRef}
          className={`bg-white dark:bg-gray-800 shadow-lg rounded-sm ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'} w-full max-w-4xl`}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
        >
          {renderSlideContent()}
        </div>
      </div>
    </div>
  );
}
