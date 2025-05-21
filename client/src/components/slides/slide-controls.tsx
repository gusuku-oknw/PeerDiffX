import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  History, 
  GitCompare, 
  AlignJustify
} from "lucide-react";

interface SlideControlsProps {
  currentSlideNumber: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onViewHistory: () => void;
  onViewDiff: () => void;
  onViewDetails?: () => void;
  presentationId: number;
  slideId: number;
  presentationName?: string;
  className?: string;
}

export function SlideControls({
  currentSlideNumber,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onViewHistory,
  onViewDiff,
  onViewDetails,
  presentationId,
  slideId,
  presentationName,
  className = ""
}: SlideControlsProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1 mr-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevSlide}
          disabled={currentSlideNumber <= 1}
          title="前のスライド"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium mx-2">
          {currentSlideNumber} / {totalSlides}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNextSlide}
          disabled={currentSlideNumber >= totalSlides}
          title="次のスライド"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onViewHistory} title="履歴を表示">
          <History className="h-4 w-4 mr-1" /> 履歴
        </Button>
        
        <Button variant="outline" size="sm" onClick={onViewDiff} title="差分を表示">
          <GitCompare className="h-4 w-4 mr-1" /> 差分
        </Button>
        
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={onViewDetails} title="詳細を表示">
            <AlignJustify className="h-4 w-4 mr-1" /> 詳細
          </Button>
        )}
      </div>
    </div>
  );
}