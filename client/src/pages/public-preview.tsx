import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useSlide, usePresentation, useSlides } from '@/hooks/use-pptx';
import { decodeId } from '@/lib/hash-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FaLayerGroup, FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus, FaExpand, FaCode, FaHistory, FaComments, FaCodeBranch } from 'react-icons/fa';
import { Home, Settings, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import SlideCanvas from '@/components/slides/slide-canvas';
import SlideThumbnails from '@/components/slides/slide-thumbnails';

/**
 * 元のデザインに近づけたプレゼンテーションプレビュー
 * レイアウト問題を解決しつつ、既存のコンポーネントを活用
 */
export default function PublicPreview() {
  const [, params] = useRoute<{ presentationId: string; commitId?: string }>('/public-preview/:presentationId/:commitId?');
  
  // 正しいデコード方法を使用
  const presentationId = params?.presentationId ? 
    decodeId(params.presentationId) || 12 
    : 12;
  
  const commitId = params?.commitId ? parseInt(params.commitId, 10) : 35;
  
  // プレゼンテーション情報を取得
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  
  // スライド情報を取得
  const { data: slides = [] } = useSlides(commitId);
  
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // 最初のスライドが読み込まれたら選択
  useEffect(() => {
    if (slides?.length > 0) {
      setCurrentSlideId(slides[0].id);
      setCurrentSlideIndex(0);
    }
  }, [slides]);
  
  // 選択したスライドが変更されたら状態を更新
  useEffect(() => {
    if (!currentSlideId && slides?.length > 0) {
      setCurrentSlideId(slides[0].id);
      setCurrentSlideIndex(0);
    } else if (currentSlideId) {
      const index = slides.findIndex((s: any) => s.id === currentSlideId);
      if (index !== -1) {
        setCurrentSlideIndex(index);
      }
    }
  }, [currentSlideId, slides]);

  // スライド選択ハンドラ
  const handleSelectSlide = (slideId: number) => {
    setCurrentSlideId(slideId);
  };

  // 前/次のスライドに移動
  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      const prevSlide = slides[currentSlideIndex - 1];
      setCurrentSlideId(prevSlide.id);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextSlide = slides[currentSlideIndex + 1];
      setCurrentSlideId(nextSlide.id);
    }
  };

  // XMLディフを表示
  const handleViewXmlDiff = () => {
    console.log("XML表示機能は準備中です");
  };
  
  // 履歴を表示
  const handleViewHistory = () => {
    console.log("履歴表示機能は準備中です");
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideIndex, slides]);

  // ローディング表示
  if (isLoadingPresentation || !presentation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <Skeleton className="h-8 w-1/2 rounded-md" />
          <Skeleton className="h-32 w-full rounded-md mt-4" />
        </div>
      </div>
    );
  }

  // メインコンテンツのレンダリング - 元のデザインに近づける
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4 flex items-center">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white mr-2">
              <FaLayerGroup className="w-4 h-4" />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">PeerDiffX</span>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {presentation?.name || 'Loading...'}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <Home className="mr-1.5 h-3.5 w-3.5" />
              ホーム
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings">
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              設定
            </Link>
          </Button>
        </div>
      </div>

      {/* メインコンテンツ - 3カラムレイアウト */}
      <div style={{
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* 左側サイドバー - プレゼンテーション情報 */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-3">プレゼンテーション情報</h3>
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-3">
              <h4 className="font-medium text-sm mb-1">{presentation?.name || 'Loading...'}</h4>
              {presentation?.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{presentation.description}</p>
              )}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                最終更新: {presentation?.updatedAt ? new Date(presentation.updatedAt).toLocaleDateString('ja-JP') : '---'}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">ブランチ</h3>
              <div className="space-y-1 mt-2">
                <div className="flex items-center px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
                  <span className="font-medium">main</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">コミット履歴</h3>
              <div className="space-y-1 mt-2">
                <div className="flex items-center px-3 py-2 rounded-md text-sm bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Initial commit
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        {/* 中央サムネイル表示部分 - 既存のコンポーネントを使用 */}
        <SlideThumbnails 
          commitId={commitId}
          activeSlideId={currentSlideId || undefined}
          onSelectSlide={handleSelectSlide}
          slides={slides}
        />
        
        {/* メインスライド表示エリア - 既存のコンポーネントを使用 */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden" style={{ minWidth: 0 }}>
          {currentSlideId ? (
            <SlideCanvas
              slideId={currentSlideId}
              totalSlides={slides.length}
              currentSlideNumber={currentSlideIndex + 1}
              onPrevSlide={goToPreviousSlide}
              onNextSlide={goToNextSlide}
              onViewXmlDiff={handleViewXmlDiff}
              onViewHistory={handleViewHistory}
              presentationId={presentationId}
              presentationName={presentation?.name}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">スライドを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}