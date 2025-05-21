import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileCode, AlertTriangle, ChevronLeft, ChevronRight, Maximize, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { SlideViewer } from "../features/slides/slide-renderer";

/**
 * Public preview page component
 * This is a standalone page for viewing presentations without needing the full editor
 * フック順序の問題を修正したバージョン - 元のデザイン保持
 */
export default function PublicPreview() {
  // 基本的な状態を先に定義
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // URLパラメータからID情報を取得（エンコードIDにも対応）
  const rawPresentationId = params?.presentationId;
  const rawCommitId = params?.commitId;
  
  const presentationId = rawPresentationId ? 
    (rawPresentationId.startsWith('pdx-') ? 
      decodeId(rawPresentationId) : 
      parseInt(rawPresentationId)) : 0;
      
  const commitId = rawCommitId ? 
    (rawCommitId.startsWith('pdx-') ? 
      decodeId(rawCommitId) : 
      parseInt(rawCommitId)) : undefined;
  
  // デバッグログ - すべての条件分岐で一貫して呼び出されるよう配置
  useEffect(() => {
    console.log('Route params:', params);
    console.log('Parsed presentationId:', presentationId);
    console.log('Parsed commitId:', commitId);
  }, [params, presentationId, commitId]);
  
  // プレゼンテーション情報の取得
  const { 
    data: presentation = {},
    isLoading: isLoadingPresentation,
    error: presentationError
  } = useQuery({
    queryKey: ['/api/presentations', presentationId],
    queryFn: async () => {
      if (!presentationId) return {};
      
      try {
        const response = await fetch(`/api/presentations/${presentationId}`);
        
        if (!response.ok) {
          // 404エラーの場合は別のプレゼンテーションを探す
          if (response.status === 404) {
            const allResponse = await fetch(`/api/presentations`);
            if (allResponse.ok) {
              const presentations = await allResponse.json();
              if (presentations.length > 0) {
                // 代替プレゼンテーションを返す
                return { ...presentations[0], alternateFound: true };
              }
            }
          }
          throw new Error("プレゼンテーションの取得に失敗しました");
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching presentation:', error);
        throw error;
      }
    },
    enabled: !!presentationId,
    staleTime: 30000,
    retry: 1
  });
  
  // 代替プレゼンテーションへのリダイレクト処理
  // 条件分岐の外でフックを定義
  useEffect(() => {
    if (presentation?.alternateFound && presentation?.id) {
      toast({
        title: "別のプレゼンテーションへリダイレクト",
        description: `ID ${presentationId} のプレゼンテーションは見つかりませんでした。利用可能なプレゼンテーションを表示します。`,
      });
      window.location.href = `/public-preview/${presentation.id}`;
    }
  }, [presentation, presentationId, toast]);

  // コミット情報を取得
  const {
    data: commit,
    isLoading: isLoadingCommit,
    error: commitError
  } = useQuery({
    queryKey: ['/api/commits', presentationId, commitId],
    queryFn: async () => {
      if (!presentationId) return null;
      
      try {
        // ブランチ情報を取得
        const branchResponse = await fetch(`/api/presentations/${presentationId}/branches`);
        if (!branchResponse.ok) {
          throw new Error("Failed to fetch branches");
        }
        
        const branches = await branchResponse.json();
        console.log(`Retrieved ${branches.length} branches`);
        
        // デフォルトブランチか最初のブランチを使用
        const defaultBranch = branches.find(branch => branch.isDefault) || branches[0];
        if (!defaultBranch) {
          throw new Error("No branches found for this presentation");
        }
        
        console.log(`Using branch: ${defaultBranch.id} (${defaultBranch.name})`);
        
        // コミット情報を取得
        const commitsResponse = await fetch(`/api/branches/${defaultBranch.id}/commits`);
        if (!commitsResponse.ok) {
          throw new Error("Failed to fetch commits");
        }
        
        const commits = await commitsResponse.json();
        console.log(`Retrieved ${commits.length} commits`);
        
        if (commits.length === 0) {
          throw new Error("No commits found for this branch");
        }
        
        // 指定されたコミットか最新コミットを返す
        if (commitId) {
          const requestedCommit = commits.find(c => c.id === commitId);
          if (!requestedCommit) {
            throw new Error(`Commit with ID ${commitId} not found`);
          }
          return requestedCommit;
        } else {
          console.log(`Using latest commit: ${commits[0].id}`);
          return commits[0];
        }
      } catch (error) {
        console.error('Error fetching commit:', error);
        throw error;
      }
    },
    enabled: !!presentationId,
  });
  
  // スライド情報を取得
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError 
  } = useQuery({
    queryKey: ['/api/slides', commit?.id],
    queryFn: async () => {
      if (!commit?.id) return [];
      
      try {
        const response = await fetch(`/api/commits/${commit.id}/slides`);
        if (!response.ok) {
          throw new Error("Failed to fetch slides");
        }
        
        const slidesData = await response.json();
        console.log(`Retrieved ${slidesData.length} slides for commit ${commit.id}:`, slidesData);
        
        return slidesData;
      } catch (error) {
        console.error('Error fetching slides:', error);
        throw error;
      }
    },
    enabled: !!commit?.id,
  });
  
  // スライド操作関数
  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex]);
  
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, slides.length]);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  // キーボードショートカットの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousSlide();
          break;
        case 'ArrowRight':
          goToNextSlide();
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousSlide, goToNextSlide, toggleFullscreen, isFullscreen]);
  
  // デバッグ情報の表示（常にフックの呼び出し順序を保つ）
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
  
  // ローディング状態の統合
  const isLoading = isLoadingPresentation || isLoadingCommit || isLoadingSlides;
  
  // 現在のスライド
  const currentSlide = slides[currentSlideIndex];
  
  // エラー表示
  if (presentationError || commitError || slidesError) {
    const error = presentationError || commitError || slidesError;
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
  
  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-4xl w-full space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            
            <div className="aspect-[16/9] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-6 w-48 mt-4" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // スライドが空の場合
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
  
  // メインのプレゼンテーション表示
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen'} flex flex-col bg-gray-50 dark:bg-gray-900`}>
      <div className="w-full max-w-7xl mx-auto p-4 flex-1 flex flex-col">
        {/* Header with presentation title */}
        {!isFullscreen && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold truncate">{presentation.name}</h1>
            <p className="text-muted-foreground">{presentation.description}</p>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Slide display */}
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
            variant="outline"
            size={isFullscreen ? "sm" : "default"}
            onClick={goToPreviousSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="mr-1" /> 前へ
          </Button>
          
          <Button
            variant="outline"
            size={isFullscreen ? "sm" : "default"}
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
          >
            次へ <ChevronRight className="ml-1" />
          </Button>
          
          <Button variant="ghost" size={isFullscreen ? "sm" : "default"} onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
            <span className="ml-2">{isFullscreen ? '通常表示' : '全画面表示'}</span>
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}