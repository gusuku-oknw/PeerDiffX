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
 * シンプルな公開プレビューコンポーネント - Reactフックのルール順守
 */
export default function PublicPreview() {
  // 基本的な状態の設定
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // URLパラメータから情報を取得
  const rawPresentationId = params?.presentationId;
  const rawCommitId = params?.commitId;
  
  // IDの変換処理（エンコードされたIDにも対応）
  const presentationId = rawPresentationId ? 
    (rawPresentationId.startsWith('pdx-') ? 
      decodeId(rawPresentationId) : 
      parseInt(rawPresentationId)) : 0;
      
  const commitId = rawCommitId ? 
    (rawCommitId.startsWith('pdx-') ? 
      decodeId(rawCommitId) : 
      parseInt(rawCommitId)) : undefined;
  
  // パラメータのデバッグログ
  useEffect(() => {
    console.log('Route params:', params);
    console.log('Parsed presentationId:', presentationId);
    console.log('Parsed commitId:', commitId);
  }, [params, presentationId, commitId]);

  // プレゼンテーション情報を取得
  const { 
    data: presentation,
    isLoading: isLoadingPresentation,
    error: presentationError
  } = useQuery({
    queryKey: ['/api/presentations', presentationId],
    queryFn: async () => {
      if (!presentationId) return null;
      
      try {
        const response = await fetch(`/api/presentations/${presentationId}`);
        
        if (!response.ok) {
          // 404エラーの場合、利用可能な他のプレゼンテーションを探す
          if (response.status === 404) {
            const allResponse = await fetch(`/api/presentations`);
            if (allResponse.ok) {
              const presentations = await allResponse.json();
              if (presentations.length > 0) {
                // 自動リダイレクト用に印をつける
                return { ...presentations[0], alternateFound: true };
              }
            }
          }
          throw new Error(`プレゼンテーションの取得に失敗しました: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching presentation:', error);
        throw error;
      }
    },
    enabled: !!presentationId,
    retry: 1
  });

  // 代替プレゼンテーションが見つかった場合のリダイレクト
  useEffect(() => {
    if (presentation?.alternateFound && presentation?.id) {
      toast({
        title: "別のプレゼンテーションへリダイレクト",
        description: `ID ${presentationId} のプレゼンテーションは見つかりませんでした。利用可能なプレゼンテーションを表示します。`,
      });
      // リダイレクト
      window.location.href = `/public-preview/${presentation.id}`;
    }
  }, [presentation, presentationId, toast]);

  // ブランチとコミット情報を取得
  const {
    data: commit,
    isLoading: isLoadingCommit,
    error: commitError
  } = useQuery({
    queryKey: ['/api/commits', presentationId, commitId],
    queryFn: async () => {
      if (!presentationId) return null;
      
      try {
        // ブランチ一覧を取得
        const branchResponse = await fetch(`/api/presentations/${presentationId}/branches`);
        if (!branchResponse.ok) {
          throw new Error("ブランチの取得に失敗しました");
        }
        
        const branches = await branchResponse.json();
        if (branches.length === 0) {
          throw new Error("プレゼンテーションにブランチがありません");
        }
        
        // デフォルトブランチか最初のブランチを使用
        const branch = branches.find(b => b.isDefault) || branches[0];
        
        // ブランチのコミット一覧を取得
        const commitResponse = await fetch(`/api/branches/${branch.id}/commits`);
        if (!commitResponse.ok) {
          throw new Error("コミットの取得に失敗しました");
        }
        
        const commits = await commitResponse.json();
        if (commits.length === 0) {
          throw new Error("ブランチにコミットがありません");
        }
        
        // 指定されたコミットか最新のコミットを返す
        if (commitId) {
          const targetCommit = commits.find(c => c.id === commitId);
          if (!targetCommit) {
            throw new Error(`コミットID ${commitId} が見つかりません`);
          }
          return targetCommit;
        }
        
        // 最新のコミットを返す
        return commits[0];
      } catch (error) {
        console.error('Error fetching commit:', error);
        throw error;
      }
    },
    enabled: !!presentationId && !presentationError,
  });

  // コミットに関連するスライドを取得
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
          throw new Error("スライドの取得に失敗しました");
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching slides:', error);
        throw error;
      }
    },
    enabled: !!commit?.id,
  });

  // キーボードによるスライド操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
        setCurrentSlideIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentSlideIndex < slides.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, isFullscreen]);

  // ナビゲーション関数
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // ローディング状態
  const isLoading = isLoadingPresentation || isLoadingCommit || isLoadingSlides;

  // エラー処理: いずれかのクエリでエラーが発生した場合
  if (presentationError || commitError || slidesError) {
    const error = presentationError || commitError || slidesError;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>プレビューの読み込みエラー</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "プレゼンテーションの読み込み中にエラーが発生しました。"}
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
          <Button variant="outline" onClick={() => window.location.href = '/public-preview/12'}>
            サンプルプレゼンテーションを表示
          </Button>
        </div>
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-4xl">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          
          <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-lg mb-4">
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    );
  }

  // スライドが存在しない場合
  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert className="max-w-2xl">
          <FileCode className="h-4 w-4" />
          <AlertTitle>スライドがありません</AlertTitle>
          <AlertDescription>
            このプレゼンテーションにはスライドが含まれていません。
            {commit && <div className="mt-2">コミットID: {commit.id}</div>}
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

  // メインのプレビュー表示
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen'} flex flex-col bg-gray-50 dark:bg-gray-900`}>
      <div className="w-full max-w-7xl mx-auto p-4 flex-1 flex flex-col">
        {/* タイトルヘッダー（フルスクリーン時は非表示） */}
        {!isFullscreen && presentation && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold truncate">{presentation.name}</h1>
            {presentation.description && (
              <p className="text-muted-foreground">{presentation.description}</p>
            )}
          </div>
        )}
        
        {/* スライド表示エリア */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div 
            className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl aspect-[16/9]'} bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden`}
            onClick={toggleFullscreen}
          >
            {slides.length > 0 && currentSlideIndex < slides.length ? (
              <div className="w-full h-full">
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
                スライドを読み込めませんでした
              </div>
            )}
          </div>
          
          {/* ナビゲーションコントロール */}
          <div className={`mt-6 flex items-center space-x-4 ${isFullscreen ? 'absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 p-2 rounded-full' : ''}`}>
            <Button
              variant="outline"
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="mr-1" /> 前へ
            </Button>
            
            <Button
              variant="outline"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              次へ <ChevronRight className="ml-1" />
            </Button>
            
            <Button 
              variant="ghost"
              onClick={toggleFullscreen}
            >
              <Maximize className="mr-2 h-4 w-4" />
              {isFullscreen ? '通常表示' : '全画面表示'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}