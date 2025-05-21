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

export default function Preview() {
  const [, params] = useRoute("/preview/:id");
  const presentationId = parseInt(params?.id || "0");
  
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: defaultBranch, isLoading: isLoadingBranch } = useBranch(presentationId, true);
  const { data: commits, isLoading: isLoadingCommits } = useCommits(defaultBranch?.id);
  
  const latestCommit = commits?.[0];
  const { data: slides, isLoading: isLoadingSlides } = useSlides(latestCommit?.id);
  
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
  
  // Set active slide when slides are loaded
  useEffect(() => {
    if (slides && slides.length > 0 && !activeSlideId) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);
  
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
    // Toggle version panel
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
    // In a real app, would implement restore functionality
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
  
  if (isLoadingPresentation || isLoadingBranch || isLoadingCommits || isLoadingSlides) {
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
  
  // Check if we have a presentation but missing other data
  if (presentation && (!defaultBranch || !latestCommit || !slides || slides.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">プレゼンテーションを初期化しています</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            このプレゼンテーションは初期化中です。ブランチやスライドデータが作成されています。
            更新するには画面をリフレッシュしてください。
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()}>
              リフレッシュ
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if we're missing the presentation entirely
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
  
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar onToggleVersionPanel={toggleVersionPanel} />
      
      {activeSlideId && (
        <>
          <SlideThumbnails 
            commitId={latestCommit.id} 
            activeSlideId={activeSlideId} 
            onSelectSlide={handleSelectSlide} 
          />
          
          <SlideCanvas 
            slideId={activeSlideId}
            totalSlides={slides.length}
            currentSlideNumber={activeSlide?.slideNumber || 1}
            onPrevSlide={handlePrevSlide}
            onNextSlide={handleNextSlide}
            onViewXmlDiff={handleViewXmlDiff}
            onViewHistory={handleViewHistory}
            versionPanelVisible={showVersionPanel}
            shareDialogComponent={
              <ShareDialog 
                presentationId={presentationId} 
                commitId={latestCommit.id} 
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
