import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FaArrowLeft, FaArrowRight, FaExpand, FaCompress, FaClock } from 'react-icons/fa';
import { useLanguage } from '@/components/i18n/language-context';

// スナップショットページコンポーネント
export default function SnapshotPage() {
  const { t } = useLanguage();
  const [, params] = useRoute('/snapshot/:id');
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // スナップショットデータの取得
  useEffect(() => {
    const fetchSnapshot = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/snapshots/${params.id}`);
        
        if (response.status === 404) {
          setError(t('snapshotNotFound'));
          return;
        }
        
        if (response.status === 410) {
          setError(t('snapshotExpired'));
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshot: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSnapshot(data);
        
        // 有効期限の表示を設定
        updateTimeRemaining(new Date(data.expiresAt));
        const interval = setInterval(() => {
          updateTimeRemaining(new Date(data.expiresAt));
        }, 60000); // 1分ごとに更新
        
        return () => clearInterval(interval);
      } catch (err) {
        console.error('Error fetching snapshot:', err);
        setError(t('snapshotError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSnapshot();
  }, [params?.id, t]);
  
  // 有効期限までの残り時間を計算
  const updateTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeRemaining(t('expired'));
      setError(t('snapshotExpired'));
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      setTimeRemaining(`${days} ${days === 1 ? t('day') : t('days')} ${hours} ${t('hours')}`);
    } else {
      setTimeRemaining(`${hours} ${t('hours')}`);
    }
  };
  
  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // スライドナビゲーション
  const goToNextSlide = () => {
    if (snapshot?.data?.slides && currentSlideIndex < snapshot.data.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  // キー操作によるナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, snapshot]);

  // スワイプイベントハンドラー
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      const threshold = 50; // スワイプ検出の閾値
      
      if (swipeDistance > threshold) {
        goToPrevSlide(); // 右にスワイプ
      } else if (swipeDistance < -threshold) {
        goToNextSlide(); // 左にスワイプ
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSlideIndex, snapshot]);

  // クリックによるナビゲーション (左右の領域でクリック)
  const handleSlideAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) {
      const slideArea = e.currentTarget;
      const clickX = e.clientX;
      const slideWidth = slideArea.clientWidth;
      
      if (clickX < slideWidth / 2) {
        goToPrevSlide();
      } else {
        goToNextSlide();
      }
    }
  };
  
  // 現在のスライド
  const currentSlide = snapshot?.data?.slides?.[currentSlideIndex];
  
  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{error}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('snapshotErrorDesc')}
          </p>
          <Button onClick={() => window.history.back()}>{t('goBack')}</Button>
        </div>
      </div>
    );
  }
  
  // ローディング表示
  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-96 w-full mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'p-4'}`}>
      {/* ヘッダー */}
      <div className={`flex justify-between items-center mb-4 ${isFullscreen ? 'px-4 py-2 bg-black/50 absolute top-0 left-0 right-0 z-10' : ''}`}>
        <div>
          <h1 className={`font-bold ${isFullscreen ? 'text-white text-xl' : 'text-2xl'}`}>
            {snapshot?.data?.presentation?.name || t('snapshot')}
          </h1>
          {!isFullscreen && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {snapshot?.data?.commit?.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isFullscreen && (
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <FaClock className="mr-1" />
              <span>{t('expiresIn')}: {timeRemaining}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>
        </div>
      </div>
      
      {/* スライド表示 */}
      <div 
        className={`relative ${isFullscreen ? 'h-full flex items-center justify-center' : 'aspect-[16/9] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'}`}
        onClick={handleSlideAreaClick}
      >
        {currentSlide ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            {/* スライドコンテンツの表示 - 実際のアプリではより高度な表示が必要 */}
            <div className="max-w-full max-h-full overflow-auto" dangerouslySetInnerHTML={{ __html: currentSlide.xmlContent }} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">{t('noSlides')}</p>
          </div>
        )}
        
        {/* ナビゲーションボタン */}
        {isFullscreen && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
            >
              <FaArrowLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
              onClick={goToNextSlide}
              disabled={!snapshot?.data?.slides || currentSlideIndex >= snapshot.data.slides.length - 1}
            >
              <FaArrowRight />
            </Button>
          </>
        )}
      </div>
      
      {/* フッター */}
      {!isFullscreen && (
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <FaArrowLeft className="mr-2" />
            {t('previous')}
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentSlideIndex + 1} / {snapshot?.data?.slides?.length || 0}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextSlide}
            disabled={!snapshot?.data?.slides || currentSlideIndex >= snapshot.data.slides.length - 1}
          >
            {t('next')}
            <FaArrowRight className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}