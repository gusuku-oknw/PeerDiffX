import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import SlideThumbnails from "@/components/slides/slide-thumbnails";
import SlideCanvas from "@/components/slides/slide-canvas";
import VersionPanel from "@/components/version/version-panel";
import DiffViewer from "@/components/diff/diff-viewer";
import { ShareDialog } from "@/components/share/share-dialog";
import { usePresentation, useCommits, useSlides } from "@/hooks/use-pptx";
import { useBranch } from "@/hooks/use-branches";
import { Button } from "@/components/ui/button";
import { decodeId } from "@/lib/hash-utils";

export default function Preview() {
  const [, params] = useRoute("/preview/:id");
  
  // すべてのstate変数を最初に宣言
  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showVersionPanel, setShowVersionPanel] = useState(true);
  const [diffViewerData, setDiffViewerData] = useState({
    slideNumber: 0,
    beforeCommitId: 0,
    afterCommitId: 0,
    beforeCommitTime: "",
    afterCommitTime: ""
  });
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  
  // URL hash parameter から presentation ID を復元
  let presentationId = 0;
  
  try {
    // 通常の数値IDの場合（ハッシュ化前のURL）
    if (params?.id && !isNaN(parseInt(params.id))) {
      presentationId = parseInt(params.id);
    } 
    // ハッシュ化されたIDの場合
    else if (params?.id) {
      const decodedId = decodeId(params.id);
      if (decodedId !== null) {
        presentationId = decodedId;
      }
    }
  } catch (error) {
    console.error("Failed to decode presentation ID:", error);
  }
  
  // すべてのデータ取得処理を一箇所にまとめる
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: defaultBranch, isLoading: isLoadingBranch } = useBranch(presentationId, true);
  const { data: commits, isLoading: isLoadingCommits } = useCommits(defaultBranch?.id);
  
  const latestCommit = commits?.[0];
  const { data: slides, isLoading: isLoadingSlides } = useSlides(latestCommit?.id);
  
  // すべてのuseEffectを集約
  // 1. スライドが読み込まれたら、最初のスライドをアクティブにする
  useEffect(() => {
    console.log("スライド読み込み状態:", slides);
    if (slides && slides.length > 0) {
      console.log("スライドが見つかりました、ID設定:", slides[0].id);
      setActiveSlideId(slides[0].id);
    }
  }, [slides]);
  
  // 2. データが不完全な場合の自動リロード
  useEffect(() => {
    if (isAutoRefreshEnabled && presentation && (!defaultBranch || !latestCommit)) {
      console.log("データが不完全です。自動リロードを準備します...");
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [presentation, defaultBranch, latestCommit, isAutoRefreshEnabled]);
  
  // 3. スライドを取得するロジック
  useEffect(() => {
    if (isAutoRefreshEnabled && latestCommit && (!slides || slides.length === 0)) {
      console.log("スライドがありません。直接APIから取得を試みます...");
      
      const fetchSlides = async () => {
        try {
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/commits/${latestCommit.id}/slides?_=${timestamp}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (response.ok) {
            const slideData = await response.json();
            console.log("APIから直接取得したスライドデータ:", slideData);
            
            if (slideData && slideData.length > 0) {
              window.location.reload();
            } else {
              setTimeout(() => {
                console.log("スライドがまだ作成されていません。再読み込みします...");
                window.location.reload();
              }, 3000);
            }
          }
        } catch (error) {
          console.error("スライド取得エラー:", error);
          setTimeout(() => window.location.reload(), 3000);
        }
      };
      
      fetchSlides();
    }
  }, [latestCommit, slides, isAutoRefreshEnabled]);
  
  // 4. デバッグ用に状態をログ出力
  useEffect(() => {
    console.log("現在の状態:", {
      presentationId,
      defaultBranch,
      latestCommit,
      slides: slides?.length,
      activeSlideId
    });
  }, [presentationId, defaultBranch, latestCommit, slides, activeSlideId]);
  
  // イベントハンドラの定義
  const handleSelectSlide = (slideId: number) => {
    setActiveSlideId(slideId);
  };
  
  const activeSlide = slides?.find(slide => slide.id === activeSlideId);
  const activeSlideIndex = slides?.findIndex(slide => slide.id === activeSlideId) ?? 0;
  
  const handlePrevSlide = () => {
    if (slides && activeSlideIndex > 0) {
      setActiveSlideId(slides[activeSlideIndex - 1].id);
    }
  };
  
  const handleNextSlide = () => {
    if (slides && activeSlideIndex < slides.length - 1) {
      setActiveSlideId(slides[activeSlideIndex + 1].id);
    }
  };
  
  const handleViewXmlDiff = () => {
    if (commits && commits.length >= 2) {
      setDiffViewerData({
        slideNumber: activeSlide?.slideNumber || 1,
        beforeCommitId: commits[1].id,
        afterCommitId: commits[0].id,
        beforeCommitTime: formatRelativeTime(commits[1].createdAt),
        afterCommitTime: formatRelativeTime(commits[0].createdAt)
      });
      setShowDiffViewer(true);
    }
  };
  
  const handleViewHistory = () => {
    setShowVersionPanel(true);
  };
  
  const toggleVersionPanel = () => {
    setShowVersionPanel(prev => !prev);
  };
  
  const handleViewChanges = (commitId: number) => {
    if (commits) {
      const latestCommitId = commits[0].id;
      setDiffViewerData({
        slideNumber: activeSlide?.slideNumber || 1,
        beforeCommitId: commitId,
        afterCommitId: latestCommitId,
        beforeCommitTime: formatRelativeTime(commits.find(c => c.id === commitId)?.createdAt || new Date()),
        afterCommitTime: "Current"
      });
      setShowDiffViewer(true);
    }
  };
  
  const handleRestoreVersion = (commitId: number) => {
    console.log("Restore to commit:", commitId);
  };
  
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
  
  // ローディング状態の判定
  const isLoading = isLoadingPresentation || isLoadingBranch || isLoadingCommits || isLoadingSlides;

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
  
  // プレゼンテーションが存在しない場合
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
  
  // メインコンテンツを返す
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
            onViewHistory={handleViewHistory}
            versionPanelVisible={showVersionPanel}
            shareDialogComponent={
              <ShareDialog 
                presentationId={presentationId} 
                commitId={latestCommit?.id} 
                slideId={activeSlideId} 
              />
            }
          />
          
          {showVersionPanel && (
            <VersionPanel 
              slideId={activeSlideId}
              onViewChanges={handleViewChanges}
              onRestoreVersion={handleRestoreVersion}
              onClose={() => setShowVersionPanel(false)}
            />
          )}
        </>
      ) : (
        // アクティブスライドがない場合は読み込み中表示
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
