import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize,
  Home,
  FileCode,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { Share } from "@/components/ui/share";
import SlideThumbnails from "@/components/slides/slide-thumbnails";
import SlideCanvas from "@/components/slides/slide-canvas";
import { FaHistory, FaCode, FaLayerGroup, FaComment } from "react-icons/fa";

/**
 * 公開プレビューページ - 本来のPeerDiffXデザインに合わせた高度なUIに修正
 */
export default function PublicPreview() {
  // 基本的な状態の設定 - フックをコンポーネントのトップレベルで定義
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState("slide");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTabPanel, setActiveTabPanel] = useState<'history' | 'xml' | 'comments'>('history');
  
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
  
  // ブランチ情報の取得
  const {
    data: branches = [],
    isLoading: isLoadingBranches,
    error: branchesError
  } = useQuery({
    queryKey: ['/api/branches', presentationId],
    queryFn: async () => {
      if (!presentationId) return [];
      
      try {
        const response = await fetch(`/api/presentations/${presentationId}/branches`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        
        const data = await response.json();
        console.log(`Retrieved ${data.length} branches`);
        return data;
      } catch (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }
    },
    enabled: !!presentationId
  });
  
  // デフォルトブランチを見つける
  const defaultBranch = branches.find(b => b.isDefault) || branches[0];
  
  // コミット情報の取得
  const {
    data: commits = [],
    isLoading: isLoadingCommits,
    error: commitsError
  } = useQuery({
    queryKey: ['/api/commits', defaultBranch?.id],
    queryFn: async () => {
      if (!defaultBranch?.id) return [];
      
      try {
        const response = await fetch(`/api/branches/${defaultBranch.id}/commits`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch commits");
        }
        
        const data = await response.json();
        console.log(`Retrieved ${data.length} commits`);
        return data;
      } catch (error) {
        console.error('Error fetching commits:', error);
        throw error;
      }
    },
    enabled: !!defaultBranch?.id
  });
  
  // 現在のコミットを決定
  const currentCommit = commitId 
    ? commits.find(c => c.id === commitId) 
    : commits[0];
  
  // スライド情報の取得
  const {
    data: slides = [],
    isLoading: isLoadingSlides,
    error: slidesError 
  } = useQuery({
    queryKey: ['/api/slides', currentCommit?.id],
    queryFn: async () => {
      if (!currentCommit?.id) return [];
      
      console.log(`Fetching slides for commit: ${currentCommit.id}`);
      
      try {
        const response = await fetch(`/api/commits/${currentCommit.id}/slides`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch slides");
        }
        
        const slidesData = await response.json();
        console.log(`Retrieved ${slidesData.length} slides for commit ${currentCommit.id}:`, slidesData);
        
        return slidesData;
      } catch (error) {
        console.error('Error fetching slides:', error);
        throw error;
      }
    },
    enabled: !!currentCommit?.id,
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
  
  // スライドIDとスライド選択
  const currentSlide = slides[currentSlideIndex];
  const currentSlideId = currentSlide?.id;
  
  const handleSelectSlide = (slideId: number) => {
    const index = slides.findIndex(slide => slide.id === slideId);
    if (index !== -1) {
      setCurrentSlideIndex(index);
    }
  };
  
  // ボトムパネルを開く
  const handleOpenBottomPanel = (tab: 'history' | 'xml' | 'comments') => {
    setActiveTabPanel(tab);
    setShowBottomPanel(true);
  };
  
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
    if (currentCommit?.id) {
      console.log('Current commit:', currentCommit);
      console.log('Loaded slides:', slides);
      console.log('Current slide index:', currentSlideIndex);
      if (slides.length > 0 && currentSlideIndex < slides.length) {
        console.log('Current slide:', slides[currentSlideIndex]);
      }
    }
  }, [currentCommit, slides, currentSlideIndex]);
  
  // ローディング状態の結合
  const isLoading = isLoadingPresentation || isLoadingBranches || isLoadingCommits || isLoadingSlides;
  
  // エラー表示
  if (presentationError || branchesError || commitsError || slidesError) {
    const error = presentationError || branchesError || commitsError || slidesError;
    console.error('Preview error:', { 
      presentationError, 
      branchesError,
      commitsError, 
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
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        
        <div className="flex-1 flex">
          {/* サイドバースケルトン */}
          <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="h-20 w-full mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
          
          {/* メインコンテンツスケルトン */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-200 dark:bg-gray-900">
            <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
              <Skeleton className="h-6 w-32" />
              <div className="ml-auto">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            
            <div className="flex-1 flex justify-center items-center p-8">
              <div className="aspect-[16/9] w-full max-w-4xl">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // スライドがない場合
  if (currentCommit?.id && slides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert className="max-w-2xl">
          <FileCode className="h-4 w-4" />
          <AlertTitle>スライドがありません</AlertTitle>
          <AlertDescription>
            このプレゼンテーションのコミット (ID: {currentCommit.id}) にはスライドが含まれていません。
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
  
  // メインコンテンツのレンダリング - PeerDiffXの元のUIスタイル
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* サムネイル表示部分 */}
      {slides.length > 0 && currentCommit && (
        <SlideThumbnails 
          commitId={currentCommit.id} 
          activeSlideId={currentSlideId} 
          onSelectSlide={handleSelectSlide} 
        />
      )}
      
      {/* スライドキャンバス部分 */}
      {currentSlideId ? (
        <SlideCanvas 
          slideId={currentSlideId}
          totalSlides={slides.length}
          currentSlideNumber={currentSlide?.slideNumber || 1}
          onPrevSlide={goToPreviousSlide}
          onNextSlide={goToNextSlide}
          onViewXmlDiff={() => handleOpenBottomPanel('xml')}
          onViewHistory={() => handleOpenBottomPanel('history')}
          presentationId={presentationId}
          presentationName={presentation?.name}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">スライドの読み込み中...</h2>
            <div className="flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
      
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