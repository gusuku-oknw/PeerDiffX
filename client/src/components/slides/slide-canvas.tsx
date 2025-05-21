import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Code, History } from "lucide-react";

interface SlideCanvasProps {
  slideId: number;
  totalSlides: number;
  currentSlideNumber: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onViewXmlDiff: () => void;
  onViewHistory: () => void;
  presentationId: number;
  presentationName?: string;
}

export default function SlideCanvas({
  slideId,
  totalSlides,
  currentSlideNumber,
  onPrevSlide,
  onNextSlide,
  onViewXmlDiff,
  onViewHistory,
  presentationId,
  presentationName
}: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [aspectRatio] = useState<'16:9' | '4:3'>('16:9');
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* ヘッダー */}
      <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-lg font-medium truncate">{presentationName || 'Untitled Presentation'}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            スライド {currentSlideNumber} / {totalSlides}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewXmlDiff}
          >
            <Code className="mr-1 h-4 w-4" />
            差分
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
          >
            <History className="mr-1 h-4 w-4" />
            履歴
          </Button>
        </div>
      </div>

      {/* Main Content Area - Flexbox with Slide Area */}
      <div className="flex-1 flex flex-col overflow-hidden slide-canvas-container">
        {/* Slide Canvas */}
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-8">
          <div 
            ref={canvasRef}
            className={`bg-white dark:bg-gray-800 shadow-lg rounded-sm ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'} w-full max-w-4xl`}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4">
                <h2 className="text-2xl font-bold mb-2">スライド {slideId}</h2>
                <p>スライド内容が表示されます</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Controls - Absolute Positioned */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 ml-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={onPrevSlide}
          disabled={currentSlideNumber <= 1}
          className="rounded-full shadow-lg"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={onNextSlide}
          disabled={currentSlideNumber >= totalSlides}
          className="rounded-full shadow-lg"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}