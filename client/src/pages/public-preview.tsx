import { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';

// 新しく作成したコンポーネント
import { PresentationInfoPanel } from '@/components/presentation/presentation-info-panel';
import { PresentationToolbar } from '@/components/presentation/presentation-toolbar';
import { PresentationThumbnails } from '@/components/presentation/presentation-thumbnails';
import { PresentationSlideViewer } from '@/components/presentation/presentation-slide-viewer';

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

export default function PublicPreview() {
  const [, params] = useRoute('/preview/:presentationId');
  const presentationId = params?.presentationId ? parseInt(params.presentationId) : null;
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // プレゼンテーションデータの取得
  const { data: presentation, isLoading: isPresentationLoading } = useQuery({
    queryKey: ['/api/presentations', presentationId],
    enabled: !!presentationId,
  });

  // スライドデータの取得
  const { data: slides = [], isLoading: isSlidesLoading } = useQuery({
    queryKey: ['/api/commits', presentationId, 'slides'],
    queryFn: async () => {
      if (!presentationId) return [];
      
      // 最新のコミットを取得
      const commitsResponse = await fetch('/api/commits');
      const commits = await commitsResponse.json();
      
      if (commits.length === 0) return [];
      
      const latestCommit = commits[0];
      
      // スライドを取得
      const slidesResponse = await fetch(`/api/commits/${latestCommit.id}/slides`);
      const slidesData = await slidesResponse.json();
      
      return slidesData.sort((a: Slide, b: Slide) => a.slideNumber - b.slideNumber);
    },
    enabled: !!presentationId,
  });

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

  if (isPresentationLoading || isSlidesLoading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        読み込み中...
      </Box>
    );
  }

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
      <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
        {/* 左側：情報パネル */}
        <PresentationInfoPanel
          presentationName={presentation.name || 'プレゼンテーション'}
          totalSlides={totalSlides}
          currentSlideNumber={currentSlideIndex + 1}
        />

        {/* 中央：メインコンテンツエリア */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* サムネイル */}
            <PresentationThumbnails
              slides={slides}
              activeSlideId={currentSlide?.id || 0}
              onSelectSlide={selectSlide}
            />

            {/* メインスライド */}
            <PresentationSlideViewer
              slide={currentSlide}
              zoomLevel={zoomLevel}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}