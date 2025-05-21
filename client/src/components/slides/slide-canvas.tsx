import React, { useEffect, useRef, useState } from "react";
import { useSlide } from "@/hooks/use-pptx";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus, FaExpand, FaCode, FaHistory, FaComments, FaCodeBranch, FaLock, FaFilter, FaRobot, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { CommentsPanel } from "@/components/comments/comments-panel";
import { AiAnalysisButton } from "@/components/ai/ai-analysis-button";
import { AiAnalysisPanel } from "@/components/ai/ai-analysis-panel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import VersionPanel from "@/components/version/version-panel";

interface SlideCanvasProps {
  slideId: number;
  totalSlides: number;
  currentSlideNumber: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onViewXmlDiff: () => void;
  onViewHistory?: () => void; // オプショナルに変更
  shareDialogComponent?: React.ReactNode;
}

export default function SlideCanvas({
  slideId,
  totalSlides,
  currentSlideNumber,
  onPrevSlide,
  onNextSlide,
  onViewXmlDiff,
  onViewHistory,
  shareDialogComponent
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
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'locks' | 'ai'>('comments');
  const canvasRef = useRef<HTMLDivElement>(null);
  
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
  
  // アスペクト比の切り替え機能は設定ページに移動したため、この関数は使用されない
  
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
          {/* 左側：XMLとAI分析のユーティリティボタン */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              onClick={onViewXmlDiff}
              title="XML表示"
            >
              <FaCode className="h-4 w-4" />
            </Button>
            
            {/* AI分析ボタン */}
            <AiAnalysisButton presentationId={1} commitId={slide?.commitId || 1} />
          </div>
          
          {/* 右側：パネル操作とコミット */}
          <div className="ml-auto flex items-center">
            {/* サイドパネルボタン */}
            <Button 
              variant="ghost"
              size="icon" 
              className={`p-1.5 rounded ${showSidePanel ? 'text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/40' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} transition-colors`}
              onClick={() => setShowSidePanel(!showSidePanel)}
              title={showSidePanel ? "パネルを閉じる" : "パネルを開く"}
            >
              {showSidePanel ? 
                <FaChevronRight className="h-4 w-4" /> : 
                <FaComments className="h-4 w-4" />
              }
            </Button>
            
            {shareDialogComponent && (
              <div className="ml-2">
                {shareDialogComponent}
              </div>
            )}
            
            <Button className="ml-2 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white transition text-sm flex items-center">
              <FaCodeBranch className="mr-2 text-white" />
              <span>Commit</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Slide Canvas and Side Panel */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-8">
        <div className="flex w-full h-full">
          <div className={`flex-1 flex items-center justify-center transition-all ${showSidePanel ? 'pr-0 lg:w-[60%] 2xl:w-2/3' : ''}`}>
            <div 
              ref={canvasRef}
              className={`bg-white dark:bg-gray-800 shadow-lg rounded-sm ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'} w-full max-w-4xl`}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            >
              {renderSlideContent()}
            </div>
          </div>
          
          {showSidePanel && (
            <div className="w-full lg:w-[40%] 2xl:w-1/3 min-h-screen bg-white dark:bg-gray-900 border-l border-gray-300 dark:border-gray-700 flex flex-col transition-all overflow-hidden z-10">
              {/* タブ切り替え部分 */}
              <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <Tabs defaultValue={activeTab} onValueChange={(val) => setActiveTab(val as 'comments' | 'history' | 'locks' | 'ai')}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/30">
                    <h3 className="font-bold text-xl text-blue-800 dark:text-blue-300 flex items-center">
                      <FaChevronLeft onClick={() => setShowSidePanel(false)} className="h-4 w-4 mr-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" />
                      情報パネル
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                      onClick={() => setShowSidePanel(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="px-4 py-3">
                    <TabsList className="w-full h-16 grid grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <TabsTrigger value="comments" className="text-sm md:text-base flex flex-col items-center justify-center gap-1 py-2">
                        <FaComments className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>コメント</span>
                      </TabsTrigger>
                      <TabsTrigger value="history" className="text-sm md:text-base flex flex-col items-center justify-center gap-1 py-2">
                        <FaHistory className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>履歴</span>
                      </TabsTrigger>
                      <TabsTrigger value="locks" className="text-sm md:text-base flex flex-col items-center justify-center gap-1 py-2">
                        <FaLock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>ロック</span>
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="text-sm md:text-base flex flex-col items-center justify-center gap-1 py-2">
                        <FaRobot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>AI分析</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="comments" className="m-0">
                    <div className="flex-1 overflow-hidden">
                      <CommentsPanel slideId={slideId} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="m-0">
                    <div className="flex-1 overflow-hidden">
                      <div className="p-4">
                        <h3 className="text-sm font-medium mb-2">バージョン履歴</h3>
                        {/* VersionPanelのロジック統合 */}
                        {slideId && (
                          <VersionPanel 
                            slideId={slideId} 
                            onViewChanges={(commitId) => console.log('View changes for commit', commitId)} 
                            onRestoreVersion={(commitId) => console.log('Restore version', commitId)}
                            onClose={() => setShowSidePanel(false)}
                          />
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="locks" className="m-0">
                    <div className="p-4">
                      <h3 className="text-sm font-medium mb-2">ファイルロック</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            <FaLock className="text-yellow-500 mr-2" />
                            <span className="text-sm">スライド 1</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>田中さんがロック中</span>
                            <Button size="sm" variant="ghost" className="ml-2 p-1">
                              <FaLock className="text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            <FaLock className="text-yellow-500 mr-2" />
                            <span className="text-sm">スライド 3</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>鈴木さんがロック中</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ai" className="m-0 p-0">
                    <div className="h-[calc(100vh-12rem)] overflow-auto px-3 py-3">
                      {slide && (
                        <AiAnalysisPanel 
                          presentationId={1} 
                          commitId={slide.commitId || 1} 
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
