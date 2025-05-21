import React, { useEffect, useRef, useState } from "react";
import { useSlide } from "@/hooks/use-pptx";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus, FaExpand, FaCode, FaHistory, FaComments, FaCodeBranch, FaLock, FaRobot, FaChevronRight, FaChevronLeft, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
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
  presentationId?: number; // プレゼンテーションID
  presentationName?: string; // プレゼンテーション名
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
  const [panelHeight, setPanelHeight] = useState(240); // 初期パネル高さ(px)
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
          <span className="text-sm font-medium">スライド {currentSlideNumber}/{totalSlides}</span>
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
            
            {/* AI分析ボタン - サイドバーに移動したため削除 */}
          </div>
          
          {/* 右側：パネル操作とコミット */}
          <div className="ml-auto flex items-center">
            {/* 下部パネルボタン - VSCode風 */}
            <Button 
              variant="ghost"
              size="icon" 
              className={`p-1.5 rounded ${showBottomPanel ? 'text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/40' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} transition-colors`}
              onClick={() => setShowBottomPanel(!showBottomPanel)}
              title={showBottomPanel ? "パネルを閉じる" : "パネルを開く"}
            >
              {showBottomPanel ? 
                <FaChevronDown className="h-4 w-4" /> : 
                <FaChevronUp className="h-4 w-4" />
              }
            </Button>
            

            
            <Button className="ml-2 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white transition text-sm flex items-center">
              <FaCodeBranch className="mr-2 text-white" />
              <span>Commit</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area - Flexbox with Slide and Bottom Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
        
        {/* VSCode風の下部パネル - 表示/非表示を切り替え */}
        {showBottomPanel && (
          <div className="flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* リサイズ用のグラブバー */}
            <div 
              ref={resizeRef}
              className="h-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-700 cursor-ns-resize group flex justify-center items-center"
              onMouseDown={handleResizeStart}
            >
              <div className="w-8 h-1 bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 rounded-full transform scale-75 group-hover:scale-100 transition-all"></div>
            </div>
            
            {/* タブナビゲーション */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 text-sm ${activeTab === 'comments' ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <div className="flex items-center">
                  <FaComments className="mr-1.5 h-3.5 w-3.5" />
                  <span>コメント</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">スライド {currentSlideNumber}</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm ${activeTab === 'history' ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <div className="flex items-center">
                  <FaHistory className="mr-1.5 h-3.5 w-3.5" />
                  <span>履歴</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('locks')}
                className={`px-4 py-2 text-sm ${activeTab === 'locks' ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <div className="flex items-center">
                  <FaLock className="mr-1.5 h-3.5 w-3.5" />
                  <span>ロック</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 text-sm ${activeTab === 'ai' ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <div className="flex items-center">
                  <FaRobot className="mr-1.5 h-3.5 w-3.5" />
                  <span>AI分析</span>
                </div>
              </button>
              
              <div className="ml-auto flex items-center pr-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBottomPanel(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* パネルコンテンツ - 可変高さのスクロール可能なエリア */}
            <div className="overflow-auto" style={{ minHeight: '100px', maxHeight: 'calc(100vh - 300px)' }}>
              {renderActiveTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}