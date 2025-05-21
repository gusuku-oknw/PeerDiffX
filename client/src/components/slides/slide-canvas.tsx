import React, { useEffect, useRef, useState } from "react";
import { useSlide } from "@/hooks/use-pptx";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus, FaExpand, FaCode, FaHistory, FaComments, FaCodeBranch, FaLock, FaRobot, FaChevronRight, FaChevronLeft, FaChevronDown, FaChevronUp, FaTimes, FaStar, FaTools } from "react-icons/fa";
import { CommentsPanel } from "@/components/comments/comments-panel";
import { AiAnalysisButton } from "@/components/ai/ai-analysis-button";
import { AiAnalysisPanel } from "@/components/ai/ai-analysis-panel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import VersionPanel from "@/components/version/version-panel";
import { SlideControls } from "@/components/slides/slide-controls";

interface SlideCanvasProps {
  slideId: number;
  totalSlides: number;
  currentSlideNumber: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onViewXmlDiff: () => void;
  onViewHistory?: () => void;
  presentationId?: number;
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
  const { data: slide, isLoading } = useSlide(slideId);
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(panelHeight);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  // フルスクリーン状態を監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // スワイプとクリックでのスライド操作（フルスクリーン時のみ）
  useEffect(() => {
    if (!isFullscreen || !canvasRef.current) return;
    
    let startX = 0;
    const MIN_SWIPE_DISTANCE = 50;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;
      
      if (Math.abs(diffX) >= MIN_SWIPE_DISTANCE) {
        if (diffX > 0 && currentSlideNumber > 1) {
          // 右へスワイプ = 前のスライド
          onPrevSlide();
        } else if (diffX < 0 && currentSlideNumber < totalSlides) {
          // 左へスワイプ = 次のスライド
          onNextSlide();
        }
      }
    };
    
    const handleClick = (e: MouseEvent) => {
      // クリック位置に基づいて左右を判定
      const { left, width } = canvasRef.current!.getBoundingClientRect();
      const clickX = e.clientX - left;
      
      if (clickX < width / 2 && currentSlideNumber > 1) {
        // 左半分をクリック = 前のスライド
        onPrevSlide();
      } else if (clickX >= width / 2 && currentSlideNumber < totalSlides) {
        // 右半分をクリック = 次のスライド
        onNextSlide();
      }
    };
    
    const element = canvasRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('click', handleClick);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('click', handleClick);
    };
  }, [isFullscreen, canvasRef, currentSlideNumber, totalSlides, onPrevSlide, onNextSlide]);

  const handleFullscreen = () => {
    if (canvasRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvasRef.current.requestFullscreen();
      }
    }
  };
  
  // リサイズハンドラー
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(100, Math.min(window.innerHeight * 0.7, startHeightRef.current + deltaY));
    setPanelHeight(newHeight);
  };
  
  const handleResizeEnd = () => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  // アクティブパネルのコンテンツをレンダリング
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'comments':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold mr-2">
                  {currentSlideNumber}
                </div>
                <h3 className="text-sm font-medium">コメント</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <FaComments className="mr-1.5 h-3 w-3" />
                  新規コメント
                </Button>
                <Button 
                  onClick={() => setShowBottomPanel(false)}
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CommentsPanel slideId={slideId} />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold mr-2">
                  {currentSlideNumber}
                </div>
                <h3 className="text-sm font-medium">バージョン履歴</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500">
                  <span>最終更新: 2023年12月15日</span>
                </div>
                <Button 
                  onClick={() => setShowBottomPanel(false)}
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slideId && (
                <VersionPanel 
                  slideId={slideId} 
                  onViewChanges={(commitId) => console.log('View changes for commit', commitId)} 
                  onRestoreVersion={(commitId) => console.log('Restore version', commitId)}
                  onClose={() => setShowBottomPanel(false)}
                />
              )}
            </div>
          </div>
        );
      case 'locks':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold mr-2">
                  {currentSlideNumber}
                </div>
                <h3 className="text-sm font-medium">ファイルロック状況</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <FaLock className="mr-1.5 h-3 w-3" />
                  現在のスライドをロック
                </Button>
                <Button 
                  onClick={() => setShowBottomPanel(false)}
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">スライド 1</span>
                  <div className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded text-xs text-yellow-700 dark:text-yellow-300">
                    ロック中
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-semibold mr-1.5">
                      T
                    </div>
                    <span>田中さん</span>
                  </div>
                  <span className="text-xs text-gray-500">10分前〜</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">スライド 3</span>
                  <div className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded text-xs text-yellow-700 dark:text-yellow-300">
                    ロック中
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-semibold mr-1.5">
                      S
                    </div>
                    <span>鈴木さん</span>
                  </div>
                  <span className="text-xs text-gray-500">2時間前〜</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">現在のスライド</span>
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">
                    未ロック
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span>誰でも編集可能</span>
                  </div>
                  <Button size="sm" variant="ghost" className="p-1">
                    <FaLock className="text-gray-400 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="h-full overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 z-10 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold mr-2">
                    {currentSlideNumber}
                  </div>
                  <h3 className="text-sm font-medium">AI分析</h3>
                </div>
                <Button 
                  onClick={() => setShowBottomPanel(false)}
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <AiAnalysisPanel
                presentationId={Number(presentationId) || 0}
                commitId={slide?.commitId || 0}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
          <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-8">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-700 shadow-lg rounded-sm aspect-[16/9] w-full max-w-4xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* スライド表示エリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* スライドコントロールバー */}
        <SlideControls
          currentSlideNumber={currentSlideNumber}
          totalSlides={totalSlides}
          onPrevSlide={onPrevSlide}
          onNextSlide={onNextSlide}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
          onViewXmlDiff={onViewXmlDiff}
          onViewHistory={onViewHistory}
          zoomLevel={zoomLevel}
          aspectRatio={aspectRatio}
          onShowBottomPanel={(tab) => {
            setActiveTab(tab);
            setShowBottomPanel(true);
          }}
          isFullscreen={isFullscreen}
        />
        
        {/* スライド本体 */}
        <div 
          ref={canvasRef}
          className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-8 relative"
        >
          {slide && (
            <div 
              className={`bg-white dark:bg-gray-800 shadow-xl mx-auto transition-all duration-200 ease-in-out overflow-hidden
                ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
              style={{ 
                width: `${zoomLevel}%`,
                maxWidth: aspectRatio === '16:9' ? '1600px' : '1200px'
              }}
            >
              {/* スライドのコンテンツをここに表示（実際のプレゼンテーションデータに基づく） */}
              {slide?.content?.elements?.map((element: any, index: number) => {
                switch (element.type) {
                  case 'text':
                    return (
                      <div 
                        key={element.id || index}
                        className="absolute" 
                        style={{
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          width: `${element.width}px`,
                          color: element.style?.color || 'inherit',
                          fontSize: `${element.style?.fontSize}px`,
                          fontWeight: element.style?.fontWeight || 'normal'
                        }}
                      >
                        {element.content}
                      </div>
                    );
                  case 'image':
                    return (
                      <img 
                        key={element.id || index}
                        src={element.src} 
                        alt={element.alt || 'スライド画像'}
                        className="absolute" 
                        style={{
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          width: `${element.width}px`,
                          height: `${element.height}px`,
                        }}
                      />
                    );
                  default:
                    return null;
                }
              }) || (
                <div className="flex items-center justify-center h-full p-8 text-center text-gray-500">
                  コンテンツを読み込めませんでした。
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 下部パネル（コメント、履歴など） */}
      {showBottomPanel && (
        <div 
          className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
          style={{ height: `${panelHeight}px` }}
        >
          {/* リサイズハンドル */}
          <div 
            ref={resizeRef}
            className="h-2 w-full bg-gray-100 dark:bg-gray-700 cursor-row-resize group flex items-center justify-center"
            onMouseDown={handleResizeStart}
          >
            <div className="w-8 h-1 bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 rounded-full transform scale-75 group-hover:scale-100 transition-all"></div>
          </div>
          
          {/* パネルのタブナビゲーション */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'comments' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('comments')}
            >
              <FaComments className="mr-1.5 h-3.5 w-3.5" />
              コメント
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'history' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory className="mr-1.5 h-3.5 w-3.5" />
              履歴
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'locks' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('locks')}
            >
              <FaLock className="mr-1.5 h-3.5 w-3.5" />
              ロック
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'ai' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('ai')}
            >
              <FaRobot className="mr-1.5 h-3.5 w-3.5" />
              AI分析
            </button>
          </div>
          
          {/* アクティブなパネルの内容 */}
          <div className="overflow-auto" style={{ height: `calc(${panelHeight}px - 42px)` }}>
            {renderActiveTabContent()}
          </div>
        </div>
      )}
    </div>
  );
}