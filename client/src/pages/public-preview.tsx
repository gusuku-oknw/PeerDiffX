import { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';

// 新しく作成したコンポーネント
import { PresentationInfoPanel } from '@/components/presentation/presentation-info-panel';
import { PresentationToolbar } from '@/components/presentation/presentation-toolbar';
import { PresentationThumbnails } from '@/components/presentation/presentation-thumbnails';
import { PresentationSlideViewer } from '@/components/presentation/presentation-slide-viewer';
// 新機能コンポーネント
import { TaskProgressBar } from '@/components/progress/task-progress-bar';
import { PopoverComment } from '@/components/comments/popover-comment';
import { CommentTemplates } from '@/components/comments/comment-templates';
import { NotificationIcon } from '@/components/notifications/notification-icon';
// 新しいナビゲーションコンポーネント
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { EnhancedHeader } from '@/components/ui/enhanced-header';

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
  
  // 新機能の状態管理
  const [showPopoverComment, setShowPopoverComment] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [completedSlides, setCompletedSlides] = useState<number[]>([1, 2]); // モックデータ: すでに完了したスライド
  const [activeHeaderTab, setActiveHeaderTab] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // 仮データで表示（バックエンド連携は後回し）
  const presentation: Presentation = {
    id: presentationId || 1,
    name: "デジタルマーケティング戦略 2025",
    description: "TechCorp株式会社の新年度マーケティング戦略プレゼンテーション"
  };
  const isPresentationLoading = false;

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
  const isSlidesLoading = false;

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

  // パンくずリストデータ
  const breadcrumbItems = [
    { label: 'ダッシュボード', href: '/' },
    { label: 'プロジェクト', href: '/projects' },
    { label: 'プレゼン資料', href: '/presentations' },
    { label: '企業説明会資料 v2.3' } // 最後の項目はリンクなし
  ];

  // 参加者データ
  const participants = [
    { id: '1', name: '佐山', avatar: '' },
    { id: '2', name: '田中', avatar: '' },
    { id: '3', name: '鈴木', avatar: '' }
  ];

  return (
    <>
      <CssBaseline />
      
      {/* 新しいヘッダー */}
      <EnhancedHeader
        projectName={presentation.name || 'プレゼンテーション'}
        progress={{ current: 5, total: 5 }}
        participants={participants}
        activeTab={activeHeaderTab}
        onTabChange={setActiveHeaderTab}
      />

      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>
        {/* 左側：情報パネル */}
        <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          {/* パンくずリスト */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Breadcrumb items={breadcrumbItems} />
          </Box>
          
          <PresentationInfoPanel
            presentationName={presentation.name || 'プレゼンテーション'}
            totalSlides={totalSlides}
            currentSlideNumber={currentSlideIndex + 1}
            lastModified="2024年12月21日"
            author="田中太郎"
            width={350}
          />
        </Box>

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