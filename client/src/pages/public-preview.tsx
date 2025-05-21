import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useSlide, usePresentation, useSlides } from '@/hooks/use-pptx';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 最小限の機能に絞ったプレゼンテーションビューア
 */
export default function PublicPreview() {
  const [, params] = useRoute<{ presentationId: string; commitId?: string }>('/public-preview/:presentationId/:commitId?');
  
  // IDは直接パースする（シンプル化のため）
  const presentationId = params?.presentationId ? 
    (params.presentationId.startsWith('pdx-') ? 
      parseInt(params.presentationId.substring(4), 10) : 
      parseInt(params.presentationId, 10)) 
    : 12; // デフォルト値
  
  const commitId = params?.commitId ? parseInt(params.commitId, 10) : 35; // デフォルト値
  
  // プレゼンテーション情報の取得
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  
  // スライド情報の取得
  const { data: slides = [] } = useSlides(commitId);
  
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  
  // 最初のスライドが読み込まれたら選択
  useEffect(() => {
    if (slides?.length > 0) {
      setCurrentSlideId(slides[0].id);
      setCurrentSlide(slides[0]);
      setCurrentSlideIndex(0);
    }
  }, [slides]);
  
  // スライド選択ハンドラ
  const handleSelectSlide = (slideId: number) => {
    setCurrentSlideId(slideId);
    const slide = slides.find((s: any) => s.id === slideId);
    if (slide) {
      setCurrentSlide(slide);
      const index = slides.findIndex((s: any) => s.id === slideId);
      setCurrentSlideIndex(index !== -1 ? index : 0);
    }
  };

  // キーボードによるスライド移動
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentSlideIndex > 0) {
          const prevSlide = slides[currentSlideIndex - 1];
          handleSelectSlide(prevSlide.id);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentSlideIndex < slides.length - 1) {
          const nextSlide = slides[currentSlideIndex + 1];
          handleSelectSlide(nextSlide.id);
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <Skeleton className="h-8 w-1/2 rounded-md" />
          <Skeleton className="h-32 w-full rounded-md mt-4" />
        </div>
      </div>
    );
  }

  // 最もシンプルなレイアウト
  return (
    <div className="flex flex-col h-screen">
      {/* 最小限のヘッダー */}
      <div className="h-12 bg-white border-b px-4 flex items-center">
        <h1 className="text-base font-medium">{presentation?.name || 'プレゼンテーション'}</h1>
      </div>

      {/* 2カラムレイアウト */}
      <div className="flex flex-1">
        {/* 左側スライド一覧 */}
        <div className="w-48 border-r bg-white overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium mb-2 px-2">スライド一覧</p>
            
            {slides.length > 0 ? (
              <div>
                {slides.map((slide: any) => (
                  <div 
                    key={slide.id}
                    className={`p-2 rounded cursor-pointer text-xs ${
                      currentSlideId === slide.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectSlide(slide.id)}
                  >
                    スライド {slide.slideNumber}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-xs text-gray-500">
                スライドがありません
              </div>
            )}
          </div>
        </div>
        
        {/* 右側スライド表示 - 極限までシンプルに */}
        <div className="flex-1 flex items-center justify-center bg-white">
          {currentSlideId && currentSlide ? (
            <div className="w-full max-w-3xl px-4">
              <div className="bg-white border rounded shadow-sm p-8 aspect-[16/9]">
                <h2 className="text-2xl font-bold">{currentSlide.title || 'タイトルなし'}</h2>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">スライドを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}