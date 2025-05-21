import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileCode, AlertTriangle, ChevronLeft, ChevronRight, Maximize, Home, Copy, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { SlideViewer } from "../features/slides/slide-renderer";
import { Share } from "@/components/ui/share";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 公開プレビューページ - デザインを保持しつつフック問題を修正したバージョン
 */
export default function PublicPreview() {
  // 基本的な状態の設定 - 必ずフックをコンポーネントのトップレベルで定義
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // URLパラメータからID情報を取得（エンコードIDにも対応）
  const rawPresentationId = params?.presentationId;
  const rawCommitId = params?.commitId;
  
  // IDの変換処理
  const presentationId = rawPresentationId ? 
    (rawPresentationId.startsWith('pdx-') ? 
      decodeId(rawPresentationId) : 
      parseInt(rawPresentationId)) : 0;
      
  const commitId = rawCommitId ? 
    (rawCommitId.startsWith('pdx-') ? 
      decodeId(rawCommitId) : 
      parseInt(rawCommitId)) : undefined;
  
  // デバッグ情報の記録
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
              return { ...presentations[0], alternateFound: true };
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
  
  // 代替プレゼンテーションへのリダイレクト処理
  useEffect(() => {
    if (presentation?.alternateFound && presentation?.id) {
      toast({
        title: "別のプレゼンテーションへリダイレクト",
        description: `ID ${presentationId} のプレゼンテーションは見つかりませんでした。利用可能なプレゼンテーションを表示します。`,
      });
      window.location.href = `/public-preview/${presentation.id}`;
    }
  }, [presentation, presentationId, toast]);
  
  // コミット情報の取得
  const {
    data: commit,
    isLoading: isLoadingCommit,
    error: commitError
  } = useQuery({
    queryKey: ['/api/commits', presentationId, commitId],
    queryFn: async () => {
      if (!presentationId) return null;
      
      console.log(`Fetching commit data - presentationId: ${presentationId}, commitId: ${commitId || 'latest'}`);
      
      try {
        // ブランチ情報を取得
        const branchResponse = await fetch(`/api/presentations/${presentationId}/branches`);
        
        if (!branchResponse.ok) {
          throw new Error("Failed to fetch branches");
        }
        
        const branches = await branchResponse.json();
        console.log(`Retrieved ${branches.length} branches`);
        
        // デフォルトブランチか最初のブランチを使用
        const defaultBranch = branches.find((branch: any) => branch.isDefault) || branches[0];
        if (!defaultBranch) {
          throw new Error("No branches found for this presentation");
        }
        
        console.log(`Using branch: ${defaultBranch.id} (${defaultBranch.name})`);
        
        // コミット情報の取得
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
          const requestedCommit = commits.find((c: any) => c.id === commitId);
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
    retry: 1
  });
  
  // スライド情報の取得
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError 
  } = useQuery({
    queryKey: ['/api/slides', commit?.id],
    queryFn: async () => {
      if (!commit?.id) return [];
      
      console.log(`Fetching slides for commit: ${commit.id}`);
      
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
  
  // ナビゲーション関数
  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);
  
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  // 共有モーダルの切り替え
  const toggleShareModal = useCallback(() => {
    setIsShareModalOpen(prev => !prev);
  }, []);
  
  // キーボードショートカット
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
  
  // デバッグ情報のログ
  useEffect(() => {
    if (commit?.id) {
      console.log('Current commit:', commit);
      console.log('Loaded slides:', slides);
      console.log('Current slide index:', currentSlideIndex);
      if (slides.length > 0 && currentSlideIndex < slides.length) {
        console.log('Current slide:', slides[currentSlideIndex]);
      }
    }
  }, [commit, slides, currentSlideIndex]);
  
  // 現在のスライド取得
  const currentSlide = slides[currentSlideIndex];
  
  // ローディング状態の結合
  const isLoading = isLoadingPresentation || isLoadingCommit || isLoadingSlides;
  
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
  
  // スライドがない場合
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
  
  // 共有URLの生成
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/public-preview/${presentationId}${commitId ? `/${commitId}` : ''}`
    : '';
  
  // メインプレビュー画面
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen'} flex flex-col bg-gray-50 dark:bg-gray-900`}>
      <div className="w-full max-w-7xl mx-auto p-4 flex-1 flex flex-col">
        {/* プレゼンテーションタイトル（フルスクリーン時は非表示） */}
        {!isFullscreen && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold truncate">{presentation.name}</h1>
            <p className="text-muted-foreground">{presentation.description}</p>
          </div>
        )}
        
        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* スライド表示エリア */}
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
          
          {/* ナビゲーションコントロール */}
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
            
            {/* 共有・情報エリア（フルスクリーン時は非表示） */}
            {!isFullscreen && (
              <>
                <Button variant="ghost" onClick={toggleShareModal}>
                  <Copy className="mr-2 h-4 w-4" />
                  共有
                </Button>
                {!presentation.isPublic && (
                  <div className="ml-auto flex items-center text-sm text-muted-foreground">
                    <Shield className="mr-1 h-3 w-3" />
                    非公開プレゼンテーション
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* 下部の追加情報（フルスクリーン時は非表示） */}
          {!isFullscreen && (
            <div className="mt-8 w-full max-w-4xl">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-medium">{commit ? commit.message : 'N/A'}</h3>
                      <p className="text-sm text-muted-foreground">
                        コミットID: {commit ? commit.id : 'N/A'} | 
                        作成日: {commit ? new Date(commit.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">スライド数: {slides.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* 共有モーダル */}
      <Share
        isOpen={isShareModalOpen}
        onClose={toggleShareModal}
        title={presentation.name || 'プレゼンテーションプレビュー'}
        url={shareUrl}
      />
    </div>
  );
}