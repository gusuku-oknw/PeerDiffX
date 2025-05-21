import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Code, History } from "lucide-react";
import { FaAiChannel } from 'react-icons/fa6';
import { Comment } from "@/components/comments/comment";
import { AddComment } from "@/components/comments/add-comment";
import { useComments } from "@/features/comments/use-comments";
import { SidebarAiAnalysisButton } from "@/components/ai/sidebar-ai-analysis-button";

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
  const [zoomLevel, setZoomLevel] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>('16:9');
  const [showComments, setShowComments] = useState(true);
  
  // スライドデータを取得
  const { data: slide, isLoading: isLoadingSlide } = useQuery({
    queryKey: [`/api/slides/${slideId}`],
    enabled: !!slideId,
  });
  
  // コメント機能
  const { 
    comments, 
    isLoading: isLoadingComments, 
    addComment, 
    updateComment, 
    deleteComment, 
    addReply 
  } = useComments(slideId);
  
  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrevSlide();
      } else if (e.key === 'ArrowRight') {
        onNextSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevSlide, onNextSlide]);

  // スライドコンテンツのレンダリング
  const renderSlideContent = () => {
    if (isLoadingSlide) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="h-4/5 w-4/5 rounded" />
        </div>
      );
    }
    
    if (!slide || !slide.content) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">スライドコンテンツが見つかりません</p>
          </div>
        </div>
      );
    }
    
    // スライドの要素を描画
    return (
      <div className="w-full h-full relative p-8">
        {slide.content.elements?.map((element: any, index: number) => {
          if (element.type === 'text') {
            return (
              <div 
                key={index}
                className="absolute"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  color: element.style?.color || 'inherit',
                  fontSize: `${element.style?.fontSize || 16}px`,
                  fontWeight: element.style?.fontWeight || 'normal'
                }}
              >
                {element.content}
              </div>
            );
          } else if (element.type === 'image' && element.src) {
            return (
              <img 
                key={index}
                src={element.src}
                alt="Slide content"
                className="absolute"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                }}
              />
            );
          }
          return null;
        })}
      </div>
    );
  };

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
            title="XMLの差分を表示"
          >
            <Code className="mr-1 h-4 w-4" />
            差分
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
            title="バージョン履歴を表示"
          >
            <History className="mr-1 h-4 w-4" />
            履歴
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAspectRatio(aspectRatio === '16:9' ? '4:3' : '16:9')}
          >
            {aspectRatio}
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
              disabled={zoomLevel <= 50}
            >
              -
            </Button>
            <span className="text-sm w-12 text-center">{zoomLevel}%</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
              disabled={zoomLevel >= 200}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flexbox with Slide and Bottom Panel */}
      <div className="flex-1 flex flex-col overflow-hidden slide-canvas-container">
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
        
        {/* Bottom Panel - Comments */}
        {showComments && (
          <div className="h-72 border-t border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col bg-white dark:bg-gray-800">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium">コメント</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComments(false)}
              >
                閉じる
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingComments ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onUpdate={updateComment}
                      onDelete={deleteComment}
                      onReply={addReply}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  このスライドにはまだコメントがありません
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <AddComment onAdd={addComment} />
            </div>
          </div>
        )}
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
      
      {/* Toggle Comments Button - Only shown when comments are hidden */}
      {!showComments && (
        <div className="absolute bottom-6 right-6">
          <Button 
            onClick={() => setShowComments(true)}
            className="rounded-full shadow-lg"
          >
            コメントを表示
          </Button>
        </div>
      )}
    </div>
  );
}