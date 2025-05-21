import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize,
  Home,
  FileCode,
  AlertTriangle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { Share } from "@/components/ui/share";
import SlideThumbnails from "@/components/slides/slide-thumbnails";
import SlideCanvas from "@/components/slides/slide-canvas";
import { FaHistory, FaCode, FaLayerGroup, FaComment, FaTools } from "react-icons/fa";

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
    refetchOnWindowFocus: false
  });
  
  // スライドデータが変更されたときに最初のスライドを選択
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex === 0) {
      console.log('Slides loaded successfully, setting first slide');
      setCurrentSlideIndex(0);
    }
  }, [slides, currentSlideIndex]);
  
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー部分 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4 flex items-center">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white mr-2">
              <FaLayerGroup className="w-4 h-4" />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">PeerDiffX</span>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {presentation?.name || 'Loading...'}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={toggleShareModal}
            size="sm" 
            variant="outline"
            className="text-xs"
          >
            共有
          </Button>
          <Button 
            asChild 
            size="sm" 
            variant="outline"
          >
            <Link href="/settings">
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              設定
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <Home className="mr-1.5 h-3.5 w-3.5" />
              ホーム
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* サイドバー部分 */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-3">プレゼンテーション情報</h3>
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-3">
                <h4 className="font-medium text-sm mb-1">{presentation?.name || 'Loading...'}</h4>
                {presentation?.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">{presentation.description}</p>
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  最終更新: {presentation?.updatedAt ? new Date(presentation.updatedAt).toLocaleDateString('ja-JP') : '---'}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3">ブランチ</h3>
              </div>
              <div className="space-y-1">
                {isLoadingBranches ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ) : (
                  branches?.map((branch: any) => (
                    <Link 
                      key={branch.id} 
                      href={`/public-preview/${presentationId}/${commits?.find((c: any) => c.branchId === branch.id)?.id || ''}`}
                      className={`flex items-center px-3 py-2 rounded-md ${branch.isDefault ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
                    >
                      <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${branch.name === 'main' ? 'bg-blue-500' : branch.name.startsWith('feature') ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                      <span className={branch.isDefault ? 'font-medium' : ''}>
                        {branch.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3">コミット履歴</h3>
              </div>
              <div className="space-y-1">
                {isLoadingCommits ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ) : (
                  commits?.map((commit: any, index: number) => (
                    <Link 
                      key={commit.id} 
                      href={`/public-preview/${presentationId}/${commit.id}`}
                      className={`flex items-center px-3 py-2 rounded-md text-sm ${commit.id === currentCommit?.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
                    >
                      <div className="flex flex-col">
                        <span className={commit.id === currentCommit?.id ? 'font-medium' : ''}>
                          {commit.message || `Commit #${index + 1}`}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(commit.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      
        {/* サムネイル表示部分 */}
        {slides.length > 0 && currentCommit && (
          <SlideThumbnails 
            commitId={currentCommit.id} 
            activeSlideId={currentSlideId}
            slides={slides}
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
    </div>
  );
}