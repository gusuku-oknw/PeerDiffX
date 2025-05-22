import { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { useRoute } from 'wouter';

// 新しく作成したコンポーネント
import { PresentationInfoPanel } from '@/components/presentation/presentation-info-panel';
import { PresentationToolbar } from '@/components/presentation/presentation-toolbar';
import { PresentationThumbnails } from '@/components/presentation/presentation-thumbnails';
import { SlideContent } from '@/features/slides/slide-renderer';

interface Slide {
  id: number;
  slideNumber: number;
  title: string;
  content: string;
  commitId: number;
}

interface Presentation {
  id: number;
  name: string;
  description: string;
}

export default function PreviewMock() {
  const [, params] = useRoute('/preview/:presentationId');
  const presentationId = params?.presentationId ? parseInt(params.presentationId) : null;
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // 仮データで表示（バックエンド連携は後回し）
  const presentation: Presentation = {
    id: presentationId || 1,
    name: "デジタルマーケティング戦略 2025",
    description: "TechCorp株式会社の新年度マーケティング戦略プレゼンテーション"
  };

  // スライド仮データ
  const slides: Slide[] = [
    {
      id: 1,
      slideNumber: 1,
      title: "デジタルマーケティング戦略 2025",
      content: "TechCorp株式会社の新年度戦略",
      commitId: 1
    },
    {
      id: 2,
      slideNumber: 2,
      title: "市場分析",
      content: "現在の市場状況と競合分析",
      commitId: 1
    },
    {
      id: 3,
      slideNumber: 3,
      title: "ターゲット顧客",
      content: "主要ターゲットセグメントの特定",
      commitId: 1
    },
    {
      id: 4,
      slideNumber: 4,
      title: "マーケティング施策",
      content: "具体的な施策とタイムライン",
      commitId: 1
    },
    {
      id: 5,
      slideNumber: 5,
      title: "予算配分",
      content: "各チャネルへの予算割り当て",
      commitId: 1
    }
  ];

  const currentSlide = slides[currentSlideIndex] || null;
  const totalSlides = slides.length;

  // スライドナビゲーション
  const goToNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const selectSlide = (slideId: number) => {
    const slideIndex = slides.findIndex((slide: Slide) => slide.id === slideId);
    if (slideIndex !== -1) {
      setCurrentSlideIndex(slideIndex);
    }
  };

  // ズーム操作
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goToPreviousSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goToNextSlide();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlideIndex(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides]);

  if (!presentation || !presentationId) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        プレゼンテーションが見つかりません
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        overflow: 'hidden',
        flexDirection: { xs: 'column', md: 'row' } // モバイルでは縦、デスクトップでは横
      }}>
        {/* 左側：情報パネル - デスクトップのみ表示 */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <PresentationInfoPanel
            presentationName={presentation.name}
            totalSlides={totalSlides}
            currentSlideNumber={currentSlideIndex + 1}
          />
        </Box>

        {/* 中央：メインコンテンツエリア */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          minWidth: 0 // フレックス子要素の縮小を許可
        }}>
          {/* ツールバー */}
          <PresentationToolbar
            currentSlideNumber={currentSlideIndex + 1}
            totalSlides={totalSlides}
            onPrevSlide={goToPreviousSlide}
            onNextSlide={goToNextSlide}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            zoomLevel={zoomLevel}
          />

          {/* スライド表示エリア */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            overflow: 'hidden',
            flexDirection: { xs: 'column', sm: 'row' }, // 小画面では縦積み
            minHeight: 0
          }}>
            {/* サムネイル */}
            <Box sx={{ 
              display: { xs: 'none', sm: 'block' }, // 極小画面では非表示
              flexShrink: 0
            }}>
              <PresentationThumbnails
                slides={slides}
                activeSlideId={currentSlide?.id || 0}
                onSelectSlide={selectSlide}
              />
            </Box>

            {/* メインスライド - 簡略化表示 */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 3,
              bgcolor: 'background.default'
            }}>
              <Box sx={{
                width: '800px',
                height: '450px',
                bgcolor: 'white',
                border: '1px solid #ddd',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                boxShadow: 2
              }}>
                {currentSlide ? (
                  <>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                      {currentSlide.title}
                    </h1>
                    <p style={{ fontSize: '1.2rem', textAlign: 'center', color: '#666' }}>
                      {currentSlide.content}
                    </p>
                    <div style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '0.9rem', color: '#999' }}>
                      {currentSlide.slideNumber} / 5
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#999' }}>スライドを読み込み中...</p>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}