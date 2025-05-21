import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SlideCanvas } from '@/components/slides/slide-canvas';
import { SlideThumbnails } from '@/components/slides/slide-thumbnails';
import { Sidebar } from '@/components/layout/sidebar';
import { decodeId } from '@/lib/id-utils';
import { apiRequest } from '@/lib/queryClient';
import { AIAnalysisPanel } from '@/components/ai/ai-analysis-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * プレゼンテーションプレビューページ
 */
export default function Preview() {
  // 基本的な状態設定
  const [, params] = useRoute('/preview/:id');
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('comments');
  const [panelHeight, setPanelHeight] = useState(250);
  
  // ドラッグ用の参照
  const dragStartYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(panelHeight);
  
  // URLパラメータからID取得
  const rawId = params?.id;
  let presentationId: number;
  
  if (rawId?.startsWith('pdx-')) {
    presentationId = decodeId(rawId);
  } else {
    presentationId = rawId ? parseInt(rawId) : 0;
  }
  
  // プレゼンテーション情報の取得
  const { 
    data: presentation,
    isLoading: isLoadingPresentation,
    error: presentationError
  } = useQuery({
    queryKey: [`/api/presentations/${presentationId}`],
    enabled: !!presentationId
  });
  
  // ブランチ取得
  const {
    data: branches = [],
    isLoading: isLoadingBranches,
    error: branchesError
  } = useQuery({
    queryKey: [`/api/presentations/${presentationId}/branches`],
    enabled: !!presentationId
  });
  
  // デフォルトブランチの検出
  const defaultBranch = branches.find((b: any) => b.isDefault) || branches[0];
  const branchId = defaultBranch?.id;
  
  // コミット取得
  const {
    data: commits = [],
    isLoading: isLoadingCommits,
    error: commitsError
  } = useQuery({
    queryKey: [`/api/branches/${branchId}/commits`],
    enabled: !!branchId
  });
  
  // 最新コミットの選択
  const latestCommit = commits[0];
  const commitId = latestCommit?.id;
  
  // スライド取得
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError
  } = useQuery({
    queryKey: [`/api/commits/${commitId}/slides`],
    enabled: !!commitId
  });
  
  // パネルの高さ調整用ハンドラ
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    dragStartYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    
    const handleDragMove = (moveEvent: MouseEvent) => {
      const deltaY = dragStartYRef.current - moveEvent.clientY;
      const newHeight = Math.max(100, Math.min(600, startHeightRef.current + deltaY));
      setPanelHeight(newHeight);
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [panelHeight]);
  
  // スライド移動ハンドラ
  const goToNextSlide = useCallback(() => {
    if (slides.length > 0 && currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [slides, currentSlideIndex]);
  
  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);
  
  // フルスクリーン切り替え
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  // サイドバー切り替え
  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);
  
  // サムネイル切り替え
  const toggleThumbnails = useCallback(() => {
    setShowThumbnails(prev => !prev);
  }, []);
  
  // 下部パネル切り替え
  const toggleBottomPanel = useCallback(() => {
    setShowBottomPanel(prev => !prev);
  }, []);
  
  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousSlide();
          break;
        case 'ArrowRight':
          goToNextSlide();
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousSlide, goToNextSlide, toggleFullscreen, isFullscreen]);
  
  // ローディング状態の統合
  const isLoading = isLoadingPresentation || isLoadingBranches || isLoadingCommits || isLoadingSlides;
  
  // 現在のスライド
  const currentSlide = slides[currentSlideIndex];
  
  // エラー表示
  if (presentationError || branchesError || commitsError || slidesError) {
    const error = presentationError || branchesError || commitsError || slidesError;
    console.error('Preview error:', { 
      presentationError, 
      branchesError,
      commitsError, 
      slidesError,
      message: error?.message 
    });
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-xl font-bold mb-4">プレビューの読み込みエラー</h1>
          <p className="mb-4">{error?.message || "プレゼンテーションの読み込み中にエラーが発生しました。"}</p>
          <Button asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* メインレイアウト - サイドバー + コンテンツエリア */}
      <div className="flex-1 flex overflow-hidden w-full h-full">
        {/* 左サイドバー */}
        {showSidebar && (
          <Sidebar 
            presentation={presentation}
            onToggleSidebar={toggleSidebar}
          />
        )}
        
        {/* スライドサムネイル */}
        {showThumbnails && (
          <SlideThumbnails 
            slides={slides || []}
            currentSlideId={currentSlide?.id}
            onSelectSlide={(slideId) => {
              const index = slides.findIndex((s: any) => s.id === slideId);
              if (index !== -1) {
                setCurrentSlideIndex(index);
              }
            }}
            onToggleThumbnails={toggleThumbnails}
            isLoading={isLoading}
          />
        )}
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SlideCanvas 
            currentSlide={currentSlide}
            isLoading={isLoading}
            onNext={goToNextSlide}
            onPrevious={goToPreviousSlide}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            onToggleThumbnails={toggleThumbnails}
            showThumbnails={showThumbnails}
            onToggleSidebar={toggleSidebar}
            showSidebar={showSidebar}
            slideCount={slides?.length || 0}
            currentSlideIndex={currentSlideIndex}
            onToggleBottomPanel={toggleBottomPanel}
            showBottomPanel={showBottomPanel}
            activeTab={activeBottomTab}
            onTabChange={setActiveBottomTab}
            panelHeight={panelHeight}
            onPanelResize={handleDragStart}
          />
        </div>
        
        {/* 右サイドバー - AIパネル（条件付き表示） */}
        {false && (
          <AIAnalysisPanel 
            presentationId={presentationId}
          />
        )}
      </div>
    </>
  );
}