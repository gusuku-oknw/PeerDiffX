import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useSlide, usePresentation, useSlides } from '@/hooks/use-pptx';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * インラインスタイルを使った最小限のプレゼンテーションビューア
 * 右側の余白問題を解決するため、すべてのスタイルをインラインで実装
 */
export default function PublicPreview() {
  const [, params] = useRoute<{ presentationId: string; commitId?: string }>('/public-preview/:presentationId/:commitId?');
  
  // IDの変換をシンプルに
  const rawPresentationId = params?.presentationId || '';
  const presentationId = rawPresentationId.startsWith('pdx-') 
    ? parseInt(rawPresentationId.substring(4), 10) 
    : parseInt(rawPresentationId, 10) || 12;
  
  const commitId = params?.commitId ? parseInt(params.commitId, 10) : 35;
  
  // プレゼンテーション情報を取得
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  
  // スライド情報を取得
  const { data: slides = [] } = useSlides(commitId);
  
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  
  // 最初のスライドを選択
  useEffect(() => {
    if (slides?.length > 0) {
      setCurrentSlideId(slides[0].id);
      setCurrentSlide(slides[0]);
      setCurrentSlideIndex(0);
    }
  }, [slides]);
  
  // 選択したスライドが変更されたら状態を更新
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '16px' }}>
          <Skeleton className="h-8 w-1/2 rounded-md" />
          <Skeleton className="h-32 w-full rounded-md mt-4" />
        </div>
      </div>
    );
  }

  // メインコンテンツのレンダリング
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <div style={{
        height: '48px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        <h1 style={{ fontSize: '14px', fontWeight: 500 }}>{presentation?.name || 'プレゼンテーション'}</h1>
      </div>

      {/* メインコンテンツ */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* 左側サムネイル */}
        <div style={{
          width: '192px',
          backgroundColor: '#fff',
          borderRight: '1px solid #e5e7eb',
          overflow: 'auto'
        }}>
          <div style={{ padding: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', padding: '0 8px' }}>スライド一覧</p>
            
            {slides.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {slides.map((slide: any) => (
                  <div 
                    key={slide.id}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: currentSlideId === slide.id ? '#ebf5ff' : 'transparent',
                      color: currentSlideId === slide.id ? '#2563eb' : 'inherit',
                    }}
                    onClick={() => handleSelectSlide(slide.id)}
                  >
                    スライド {slide.slideNumber}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '8px', fontSize: '12px', color: '#6b7280' }}>
                スライドがありません
              </div>
            )}
          </div>
        </div>
        
        {/* 右側スライド表示 */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '16px',
          overflow: 'hidden'
        }}>
          {currentSlideId && currentSlide ? (
            <div style={{
              width: '100%',
              maxWidth: '800px',
              aspectRatio: '16/9',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderRadius: '4px',
              padding: '32px',
              position: 'relative'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                {currentSlide.title || 'タイトルなし'}
              </h2>
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
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <p>スライドを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}