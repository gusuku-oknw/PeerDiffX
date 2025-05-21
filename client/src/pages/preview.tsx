import { useState } from "react";
import { useRoute } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import SlideThumbnails from "@/components/slides/slide-thumbnails";
import SlideCanvas from "@/components/slides/slide-canvas";
import VersionPanel from "@/components/version/version-panel";
import DiffViewer from "@/components/diff/diff-viewer";
import { ShareDialog } from "@/components/share/share-dialog";
import { Button } from "@/components/ui/button";
import { decodeId } from "@/lib/hash-utils";
import { usePresentationState } from "@/features/presentation/use-presentation-state";

export default function Preview() {
  const [, params] = useRoute("/preview/:id");
  
  // UI状態
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showVersionPanel, setShowVersionPanel] = useState(true);
  const [diffViewerData, setDiffViewerData] = useState({
    slideNumber: 0,
    beforeCommitId: 0,
    afterCommitId: 0,
    beforeCommitTime: "",
    afterCommitTime: ""
  });
  
  // URLからプレゼンテーションIDを取得
  let presentationId = 0;
  try {
    if (params?.id && !isNaN(parseInt(params.id))) {
      presentationId = parseInt(params.id);
    } else if (params?.id) {
      const decodedId = decodeId(params.id);
      if (decodedId !== null) {
        presentationId = decodedId;
      }
    }
  } catch (error) {
    console.error("プレゼンテーションIDのデコードに失敗:", error);
  }
  
  // プレゼンテーション状態管理
  const {
    presentation,
    latestCommit,
    slides,
    activeSlideId,
    activeSlide,
    isLoading,
    handleSelectSlide,
    handlePrevSlide,
    handleNextSlide
  } = usePresentationState(presentationId);
  
  // ヘルパー関数
  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };
  
  // イベントハンドラ
  const handleViewXmlDiff = () => {
    if (latestCommit && slides && slides.length >= 2) {
      setDiffViewerData({
        slideNumber: activeSlide?.slideNumber || 1,
        beforeCommitId: latestCommit.id,
        afterCommitId: latestCommit.id,
        beforeCommitTime: formatRelativeTime(latestCommit.createdAt),
        afterCommitTime: "Current"
      });
      setShowDiffViewer(true);
    }
  };
  
  const toggleVersionPanel = () => {
    setShowVersionPanel(prev => !prev);
  };
  
  const handleViewChanges = (commitId: number) => {
    if (latestCommit) {
      setDiffViewerData({
        slideNumber: activeSlide?.slideNumber || 1,
        beforeCommitId: commitId,
        afterCommitId: latestCommit.id,
        beforeCommitTime: "Previous",
        afterCommitTime: "Current"
      });
      setShowDiffViewer(true);
    }
  };
  
  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex justify-center items-center h-full">
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // プレゼンテーションが存在しない場合のエラー表示
  if (!presentation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">プレゼンテーションが見つかりません</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            指定されたプレゼンテーションが見つかりませんでした。
          </p>
          <Button onClick={() => window.location.href = "/"}>
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }
  
  // メインコンテンツのレンダリング
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar onToggleVersionPanel={toggleVersionPanel} />
      
      {activeSlideId ? (
        <>
          <SlideThumbnails 
            commitId={latestCommit?.id} 
            activeSlideId={activeSlideId} 
            onSelectSlide={handleSelectSlide} 
          />
          
          <SlideCanvas 
            slideId={activeSlideId}
            totalSlides={slides?.length || 0}
            currentSlideNumber={activeSlide?.slideNumber || 1}
            onPrevSlide={handlePrevSlide}
            onNextSlide={handleNextSlide}
            onViewXmlDiff={handleViewXmlDiff}
            onViewHistory={() => setShowVersionPanel(true)}
            presentationId={presentationId}
            presentationName={presentation?.name}
            shareDialogComponent={
              <ShareDialog 
                presentationId={presentationId} 
                commitId={latestCommit?.id} 
                slideId={activeSlideId} 
              />
            }
          />
        </>
      ) : (
        // スライドがロードされていない場合の表示
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">スライドを読み込み中...</h2>
            <div className="flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
      
      <DiffViewer 
        isOpen={showDiffViewer}
        onClose={() => setShowDiffViewer(false)}
        slideNumber={diffViewerData.slideNumber}
        beforeCommitId={diffViewerData.beforeCommitId}
        afterCommitId={diffViewerData.afterCommitId}
        beforeCommitTime={diffViewerData.beforeCommitTime}
        afterCommitTime={diffViewerData.afterCommitTime}
      />
    </div>
  );
}