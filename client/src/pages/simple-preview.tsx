import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useSlide, usePresentation, usePresentationBranches, useBranchCommits, useCommitSlides } from '@/hooks/use-pptx';
import { decodeHashId } from '@/lib/hash-id';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * シンプルなプレゼンテーションプレビューページ
 */
export default function SimplePreview() {
  // パス解析(フォーマット: /public-preview/pdx-{presentationId}/{commitId}?)
  const [, params] = useRoute<{ presentationId: string; commitId?: string }>('/simple-preview/:presentationId/:commitId?');
  
  // presentationIdをデコード
  const presentationId = params?.presentationId ? decodeHashId(params.presentationId) : null;
  const commitId = params?.commitId ? parseInt(params.commitId) : null;
  
  console.log('Parsed presentationId:', presentationId);
  console.log('Parsed commitId:', commitId);
  
  // プレゼンテーション情報の取得
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  
  // ブランチ情報の取得
  const { data: branches = [] } = usePresentationBranches(presentationId);
  const defaultBranch = branches?.find((b: any) => b.isDefault) || branches?.[0];
  
  // コミット情報の取得
  const { data: commits = [] } = useBranchCommits(defaultBranch?.id);
  const currentCommit = commitId 
    ? commits?.find((c: any) => c.id === commitId) 
    : commits?.[0]; // 最新コミットを表示
  
  // スライド情報の取得
  const { data: slides = [] } = useCommitSlides(currentCommit?.id);
  
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
  
  // スライドが更新されたら現在のスライドも更新
  useEffect(() => {
    if (!currentSlideId && slides?.length > 0) {
      setCurrentSlideId(slides[0].id);
      setCurrentSlide(slides[0]);
      setCurrentSlideIndex(0);
    } else if (currentSlideId) {
      const slide = slides?.find((s: any) => s.id === currentSlideId);
      if (slide) {
        setCurrentSlide(slide);
        const index = slides.findIndex((s: any) => s.id === currentSlideId);
        setCurrentSlideIndex(index !== -1 ? index : 0);
      }
    }
  }, [currentSlideId, slides]);

  // スライド選択ハンドラ
  const handleSelectSlide = (slideId: number) => {
    setCurrentSlideId(slideId);
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentSlideIndex > 0) {
          const prevSlide = slides[currentSlideIndex - 1];
          setCurrentSlideId(prevSlide.id);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentSlideIndex < slides.length - 1) {
          const nextSlide = slides[currentSlideIndex + 1];
          setCurrentSlideId(nextSlide.id);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2 rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // 最もシンプルなレイアウト
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 最小限のヘッダー */}
      <div className="h-12 bg-white border-b px-4 flex items-center">
        <h1 className="text-base font-medium">{presentation?.name || 'プレゼンテーション'}</h1>
      </div>

      {/* メイン部分 */}
      <div className="flex flex-1 bg-white">
        {/* 左側スライド一覧 */}
        <div className="w-48 border-r bg-white">
          <div className="p-2">
            <p className="text-xs font-medium mb-2 px-2">スライド</p>
            
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
        
        {/* 右側スライド表示 */}
        <div className="flex-1 bg-white">
          {currentSlideId && currentSlide ? (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="w-full max-w-4xl mx-auto aspect-[16/9] bg-white shadow-sm border">
                <div className="p-8">
                  <h2 className="text-3xl font-bold mb-4">{currentSlide.title || 'タイトルなし'}</h2>
                  {currentSlide.content && currentSlide.content.elements && (
                    <div>
                      {currentSlide.content.elements.map((element: any, idx: number) => (
                        element.type === 'text' && (
                          <p key={idx} style={{
                            position: 'absolute',
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            color: element.style?.color || '#000',
                            fontSize: `${element.style?.fontSize || 16}px`,
                            fontWeight: element.style?.fontWeight || 'normal',
                          }}>
                            {element.content}
                          </p>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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