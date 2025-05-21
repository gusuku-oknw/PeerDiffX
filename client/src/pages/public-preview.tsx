import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileCode, AlertTriangle, ChevronLeft, ChevronRight, Maximize, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { renderSlideContent, Slide } from "../features/slides/slide-renderer";

/**
 * Public preview page component
 * This is a standalone page for viewing presentations without needing the full editor
 */
export default function PublicPreview() {
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Extract IDs from URL parameters
  const presentationId = params?.presentationId ? parseInt(params.presentationId) : 0;
  const commitId = params?.commitId ? parseInt(params.commitId) : undefined;
  
  // Fetch presentation data
  const { 
    data: presentation = {},
    isLoading: isLoadingPresentation,
    error: presentationError
  } = useQuery<{name?: string}>({
    queryKey: ['/api/presentations', presentationId]
  });
  
  // Fetch commit data (either specified commit or latest)
  const {
    data: commit,
    isLoading: isLoadingCommit,
    error: commitError
  } = useQuery<{id: number, message?: string}>({
    queryKey: ['/api/preview/commit', presentationId, commitId],
    queryFn: async () => {
      if (commitId) {
        // Fetch specific commit
        const response = await fetch(`/api/commits/${commitId}`);
        if (!response.ok) throw new Error("指定されたコミットが見つかりませんでした");
        return response.json();
      } else {
        // Fetch latest commit from default branch
        const branchesResponse = await fetch(`/api/presentations/${presentationId}/branches`);
        if (!branchesResponse.ok) throw new Error("ブランチ情報の取得に失敗しました");
        
        const branches = await branchesResponse.json();
        const defaultBranch = branches.find((b: any) => b.isDefault) || branches[0];
        
        if (!defaultBranch) throw new Error("ブランチが見つかりませんでした");
        
        const commitsResponse = await fetch(`/api/branches/${defaultBranch.id}/commits`);
        if (!commitsResponse.ok) throw new Error("コミット情報の取得に失敗しました");
        
        const commits = await commitsResponse.json();
        if (!commits.length) throw new Error("コミットが見つかりませんでした");
        
        return commits[0]; // Latest commit
      }
    },
    enabled: !!presentationId
  });
  
  // Fetch slides for the current commit
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError
  } = useQuery<Slide[]>({
    queryKey: ['/api/preview/slides', commit?.id],
    queryFn: async () => {
      if (!commit?.id) return [];
      
      const response = await fetch(`/api/commits/${commit.id}/slides`);
      if (!response.ok) throw new Error("スライドの取得に失敗しました");
      
      return response.json();
    },
    enabled: !!commit?.id
  });
  
  // Navigate to previous slide
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  // Navigate to next slide
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, isFullscreen]);
  
  // Combine loading states
  const isLoading = isLoadingPresentation || isLoadingCommit || isLoadingSlides;
  
  // Get the current slide
  const currentSlide = slides[currentSlideIndex];
  
  // If there's an error, show error UI
  if (presentationError || commitError || slidesError) {
    const error = presentationError || commitError || slidesError;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>プレビューの読み込みエラー</AlertTitle>
          <AlertDescription>
            {error?.message || "プレゼンテーションの読み込み中にエラーが発生しました。もう一度お試しください。"}
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-4">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl aspect-[16/9] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <Skeleton className="w-full h-full" />
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </main>
      </div>
    );
  }
  
  // Return UI for empty slides
  if (!slides.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert className="max-w-2xl">
          <FileCode className="h-4 w-4" />
          <AlertTitle>スライドがありません</AlertTitle>
          <AlertDescription>
            このプレゼンテーションにはスライドが含まれていません。
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Main UI for slide presentation
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen'} flex flex-col bg-gray-50 dark:bg-gray-900`}>
      {/* Header with presentation info - hidden in fullscreen mode */}
      {!isFullscreen && (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-xl font-bold">{presentation?.name || 'プレゼンテーション'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {commit?.message || 'バージョン情報なし'} • スライド {currentSlideIndex + 1} / {slides.length}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4 mr-1" />
              全画面表示
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-1" />
                ホーム
              </Link>
            </Button>
          </div>
        </header>
      )}
      
      {/* Main slide content */}
      <main className={`flex-1 flex flex-col items-center justify-center p-4 ${isFullscreen ? 'px-0 py-0' : ''}`}>
        <div 
          className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl aspect-[16/9]'} bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden`}
          onClick={toggleFullscreen}
        >
          {currentSlide && (
            <div className="w-full h-full">
              {renderSlideContent(currentSlide)}
            </div>
          )}
        </div>
        
        {/* Navigation controls - simplified in fullscreen mode */}
        <div className={`mt-6 flex items-center space-x-4 ${isFullscreen ? 'absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 p-2 rounded-full' : ''}`}>
          <Button 
            variant={isFullscreen ? "ghost" : "outline"} 
            size="icon" 
            onClick={goToPrevSlide} 
            disabled={currentSlideIndex === 0}
            className={isFullscreen ? "text-white hover:bg-black/40" : ""}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          {!isFullscreen && (
            <div className="text-sm">
              {currentSlideIndex + 1} / {slides.length}
            </div>
          )}
          
          <Button 
            variant={isFullscreen ? "ghost" : "outline"} 
            size="icon" 
            onClick={goToNextSlide} 
            disabled={currentSlideIndex === slides.length - 1}
            className={isFullscreen ? "text-white hover:bg-black/40" : ""}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </main>
    </div>
  );
}