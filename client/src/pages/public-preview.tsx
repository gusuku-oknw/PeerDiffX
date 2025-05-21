import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useSlide, usePresentation, useSlides } from '@/hooks/use-pptx';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FaLayerGroup } from 'react-icons/fa';
import { Home } from 'lucide-react';

/**
 * 改良版プレゼンテーションプレビュー
 * UIコンポーネントを使いつつ、レイアウト問題を解決
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

  // メインコンテンツのレンダリング
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
      {/* ヘッダー - UIコンポーネントを使用 */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4 flex items-center">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white mr-2">
              <FaLayerGroup className="w-4 h-4" />
            </div>
            <span className="font-semibold text-gray-800">PeerDiffX</span>
          </Link>
          <div className="text-sm text-gray-600 ml-2">
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
        </div>
      </div>

      {/* メインコンテンツ - インラインスタイルで構造を保証 */}
      <div style={{
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* 左側サムネイル - UIクラスとインラインスタイルの組み合わせ */}
        <div className="border-r bg-white" style={{ width: '240px', overflow: 'auto' }}>
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">スライド一覧</h3>
            
            {slides.length > 0 ? (
              <div className="space-y-2">
                {slides.map((slide: any) => (
                  <div 
                    key={slide.id}
                    className={`p-2 rounded-md cursor-pointer ${
                      currentSlideId === slide.id 
                        ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectSlide(slide.id)}
                  >
                    <div className="w-full rounded-md overflow-hidden border border-gray-200 mb-1 aspect-video bg-white">
                      {slide.thumbnail ? (
                        <img src={slide.thumbnail} alt={`スライド ${slide.slideNumber}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                          <div className="text-xs">{slide.slideNumber}</div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs truncate">{slide.title || `スライド ${slide.slideNumber}`}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 px-2 text-center text-gray-500 text-sm">
                スライドがありません
              </div>
            )}
          </div>
        </div>
        
        {/* 右側スライド表示 - 全幅表示のためのスタイリング */}
        <div style={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '16px',
          overflow: 'hidden',
          width: 'calc(100% - 240px)'
        }}>
          {currentSlideId && currentSlide ? (
            <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] bg-white rounded shadow-sm">
              <div className="absolute inset-0 p-8 flex flex-col">
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
              
              {/* スライド下部のコントロール */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={goToPreviousSlide}
                    disabled={currentSlideIndex === 0}
                  >
                    前へ
                  </Button>
                  <div className="text-xs text-gray-500">
                    {currentSlideIndex + 1} / {slides.length}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={goToNextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    次へ
                  </Button>
                </div>
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