import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileCode, AlertTriangle, ChevronLeft, ChevronRight, Maximize, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { SlideViewer, type Slide } from "../features/slides/slide-renderer";

/**
 * Public preview page component
 * This is a standalone page for viewing presentations without needing the full editor
 */
export default function PublicPreview() {
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Extract IDs from URL parameters and ensure they are valid numbers
  const presentationId = params?.presentationId ? parseInt(params.presentationId) : 0;
  const commitId = params?.commitId ? parseInt(params.commitId) : undefined;
  
  // Debug the route parameters
  useEffect(() => {
    console.log('Route params:', params);
    console.log('Parsed presentationId:', presentationId);
    console.log('Parsed commitId:', commitId);
  }, [params, presentationId, commitId]);
  
  // Fetch presentation data
  const { 
    data: presentation = {},
    isLoading: isLoadingPresentation,
    error: presentationError
  } = useQuery<{name?: string, description?: string, id?: number, alternateFound?: boolean}>({
    queryKey: ['/api/presentations', presentationId],
    queryFn: async () => {
      if (!presentationId) {
        console.warn('No presentation ID provided, skipping fetch');
        return {};
      }
      
      console.log(`Fetching presentation: ${presentationId}`);
      try {
        const response = await fetch(`/api/presentations/${presentationId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch presentation:', response.status, response.statusText);
          
          if (response.status === 404) {
            toast({
              title: "プレゼンテーションが見つかりません",
              description: `ID ${presentationId} のプレゼンテーションは存在しません。別のプレゼンテーションを選択してください。`,
              variant: "destructive"
            });
            
            // 代わりに利用可能なプレゼンテーション一覧を取得
            const allResponse = await fetch(`/api/presentations`);
            const presentations = await allResponse.json();
            
            if (presentations.length > 0) {
              console.log('Available presentations:', presentations);
              // 最初のプレゼンテーションを代わりに表示する選択肢があることを示す
              return { id: presentations[0].id, name: presentations[0].name, alternateFound: true };
            }
          }
          
          throw new Error("プレゼンテーションの取得に失敗しました");
        }
        
        const data = await response.json();
        console.log('Presentation data received:', data);
        return data;
      } catch (error) {
        console.error('Error in presentation fetch:', error);
        throw error;
      }
    },
    enabled: !!presentationId,
    staleTime: 30000,
    retry: 1
  });
  
  // Fetch commit data (either specified commit or latest)
  const {
    data: commit,
    isLoading: isLoadingCommit,
    error: commitError
  } = useQuery<{id: number, message?: string, branchId: number, userId: string, createdAt: string}>({
    queryKey: ['/api/commits', presentationId, commitId],
    queryFn: async () => {
      try {
        console.log(`Fetching commit data - presentationId: ${presentationId}, commitId: ${commitId || 'latest'}`);
        
        if (commitId) {
          // Fetch specific commit
          const response = await fetch(`/api/commits/${commitId}`);
          if (!response.ok) {
            console.error(`Failed to fetch commit ${commitId}:`, response.status);
            throw new Error("指定されたコミットが見つかりませんでした");
          }
          const data = await response.json();
          console.log(`Retrieved commit: ${commitId}`, data);
          return data;
        } else {
          // Fetch latest commit from default branch
          console.log(`Fetching branches for presentation: ${presentationId}`);
          const branchesResponse = await fetch(`/api/presentations/${presentationId}/branches`);
          if (!branchesResponse.ok) {
            console.error(`Failed to fetch branches:`, branchesResponse.status);
            throw new Error("ブランチ情報の取得に失敗しました");
          }
          
          const branches = await branchesResponse.json();
          console.log(`Retrieved ${branches.length} branches`);
          
          // Find default branch or use first branch
          const defaultBranch = branches.find((b: any) => b.isDefault) || branches[0];
          
          if (!defaultBranch) {
            console.error('No branches found');
            throw new Error("ブランチが見つかりませんでした");
          }
          
          console.log(`Using branch: ${defaultBranch.id} (${defaultBranch.name})`);
          const commitsResponse = await fetch(`/api/branches/${defaultBranch.id}/commits`);
          if (!commitsResponse.ok) {
            console.error(`Failed to fetch commits:`, commitsResponse.status);
            throw new Error("コミット情報の取得に失敗しました");
          }
          
          const commits = await commitsResponse.json();
          console.log(`Retrieved ${commits.length} commits`);
          
          if (!commits.length) {
            console.error('No commits found');
            throw new Error("コミットが見つかりませんでした");
          }
          
          console.log(`Using latest commit: ${commits[0].id}`);
          return commits[0]; // Latest commit
        }
      } catch (error) {
        console.error('Error fetching commit data:', error);
        throw error;
      }
    },
    enabled: !!presentationId,
    staleTime: 30000
  });
  
  // Fetch slides for the current commit
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError
  } = useQuery<Slide[]>({
    queryKey: ['/api/commits', commit?.id, 'slides'],
    queryFn: async () => {
      try {
        if (!commit?.id) {
          console.warn('No commit ID available, skipping slide fetch');
          return [];
        }
        
        console.log(`Fetching slides for commit: ${commit.id}`);
        const response = await fetch(`/api/commits/${commit.id}/slides`);
        
        if (!response.ok) {
          console.error('Failed to fetch slides:', response.status, response.statusText);
          throw new Error("スライドの取得に失敗しました");
        }
        
        const data = await response.json();
        console.log(`Retrieved ${data.length} slides for commit ${commit.id}:`, data);
        
        if (data.length === 0) {
          console.warn(`No slides found for commit ${commit.id}`);
        }
        
        // 確実にSlideの型にフォーマットして返す
        return data.map((slide: any) => ({
          id: slide.id,
          commitId: slide.commitId,
          slideNumber: slide.slideNumber,
          title: slide.title || null,
          content: slide.content || {},
          thumbnail: slide.thumbnail || null,
          xmlContent: slide.xmlContent || null
        }));
      } catch (error) {
        console.error('Error fetching slides:', error);
        throw error;
      }
    },
    enabled: !!commit?.id,
    staleTime: 30000,
    retry: 1
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
  
  // Ensure all useEffect hooks are called unconditionally at the top level
  // リダイレクト処理のuseEffect - このフックはすべてのレンダリングパスで実行される必要があります
  useEffect(() => {
    if (presentation?.alternateFound && presentation?.id) {
      // 存在しないプレゼンテーションから存在するものへ自動リダイレクト
      toast({
        title: "別のプレゼンテーションへリダイレクト",
        description: `ID ${presentationId} のプレゼンテーションは見つかりませんでした。利用可能なプレゼンテーションを表示します。`,
      });
      
      // 新しいURLへリダイレクト
      window.location.href = `/public-preview/${presentation.id}`;
    }
  }, [presentation, presentationId, toast]);

  // If there's an error, show error UI
  if (presentationError || commitError || slidesError) {
    const error = presentationError || commitError || slidesError;
    // エラー情報をコンソールに出力
    console.error('Preview error:', { 
      presentationError, 
      commitError, 
      slidesError,
      message: error?.message 
    });
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>プレビューの読み込みエラー</AlertTitle>
          <AlertDescription>
            {error?.message || "プレゼンテーションの読み込み中にエラーが発生しました。"}
            <div className="mt-2 text-sm">
              ID: {presentationId} {commitId ? `/ コミットID: ${commitId}` : ''}
            </div>
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex space-x-4">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.href = `/public-preview/12`}>
            サンプルプレゼンテーションを表示
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
  
  // This debugging effect hook must be placed here for consistent order
  useEffect(() => {
    if (commit?.id) {
      console.log('Current commit:', commit);
      console.log('Loaded slides:', slides);
      console.log('Current slide index:', currentSlideIndex);
      if (slides && slides.length > 0 && currentSlideIndex < slides.length) {
        console.log('Current slide:', slides[currentSlideIndex]);
      }
    }
  }, [commit, slides, currentSlideIndex]);

  // Return UI for empty slides
  if (commit?.id && slides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert className="max-w-2xl">
          <FileCode className="h-4 w-4" />
          <AlertTitle>スライドがありません</AlertTitle>
          <AlertDescription>
            このプレゼンテーションのコミット (ID: {commit.id}) にはスライドが含まれていません。
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
          {slides && slides.length > 0 && currentSlideIndex < slides.length ? (
            <div className="w-full h-full transition-opacity duration-300 ease-in-out">
              <SlideViewer 
                slide={slides[currentSlideIndex]} 
                aspectRatio={isFullscreen ? undefined : "16:9"} 
              />
              <div className="absolute bottom-3 right-3 text-xs bg-black/30 text-white px-2 py-1 rounded">
                {currentSlideIndex + 1} / {slides.length}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
              <div className="text-center">
                <div className="mb-4">スライドデータの読み込み中、または表示可能なスライドがありません</div>
                {commit && (
                  <div className="text-sm text-gray-500">
                    コミットID: {commit.id} / スライド数: {slides ? slides.length : 0}
                  </div>
                )}
              </div>
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