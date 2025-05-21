import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Home, 
  Copy, 
  History, 
  Code, 
  Layers, 
  FileSearch, 
  GitBranch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { decodeId } from "@/lib/hash-utils";
import { SlideViewer } from "../features/slides/slide-renderer";
import { Share } from "@/components/ui/share";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * 公開プレビューページ - 元のPeerDiffXデザインに合わせた高度なUIに修正
 */
export default function PublicPreview() {
  // 基本的な状態の設定 - 必ずフックをコンポーネントのトップレベルで定義
  const [, params] = useRoute("/public-preview/:presentationId/:commitId?");
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("slide");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
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
  
  // 現在のスライド取得
  const currentSlide = slides[currentSlideIndex];
  
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
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* サイドバー部分のスケルトン */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-5 w-full mb-3" />
          <Skeleton className="h-5 w-24 mb-6" />
          
          <Skeleton className="h-6 w-20 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        
        {/* メインコンテンツのスケルトン */}
        <div className="flex-1 flex flex-col">
          <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
            <Skeleton className="h-6 w-40" />
            <div className="ml-auto flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center p-8">
            <div className="aspect-[16/9] w-full max-w-4xl">
              <Skeleton className="w-full h-full rounded-lg" />
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
          <FileSearch className="h-4 w-4" />
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
  
  // スライドのサムネイル生成
  const renderSlideThumbnails = () => {
    return slides.map((slide, index) => (
      <div 
        key={slide.id}
        className={`relative p-2 border cursor-pointer transition-all ${currentSlideIndex === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
        onClick={() => setCurrentSlideIndex(index)}
      >
        <div className="aspect-[16/9] bg-white dark:bg-gray-900 overflow-hidden">
          <div className="scale-[0.25] origin-top-left w-[400%] h-[400%]">
            <SlideViewer slide={slide} hideControls />
          </div>
        </div>
        <div className="mt-1 text-xs text-center text-gray-700 dark:text-gray-300 truncate">
          {slide.title || `スライド ${slide.slideNumber}`}
        </div>
        <Badge 
          variant="outline" 
          className="absolute top-1 left-1"
        >
          {slide.slideNumber}
        </Badge>
      </div>
    ));
  };
  
  // 履歴表示機能
  const renderCommitHistory = () => {
    return (
      <div className="space-y-4">
        {commits.map((commit, index) => (
          <Card key={commit.id} className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium">{commit.message}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(commit.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                  {index === 0 ? "最新" : `${index + 1}つ前`}
                </Badge>
              </div>
            </CardHeader>
            {index === 0 && index < commits.length - 1 && (
              <CardContent className="py-3 px-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/public-preview/${presentationId}/${commits[1].id}`}
                >
                  前のバージョンと比較
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };
  
  // ブランチ表示機能
  const renderBranches = () => {
    return (
      <div className="space-y-4">
        {branches.map((branch) => (
          <Card 
            key={branch.id} 
            className={`shadow-sm ${branch.id === defaultBranch?.id ? 'border-blue-500' : ''}`}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium">
                    <GitBranch className="inline-block h-4 w-4 mr-1" />
                    {branch.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {branch.description || '説明なし'}
                  </p>
                </div>
                {branch.isDefault && (
                  <Badge variant="default" className="text-xs">
                    デフォルト
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  };
  
  // XMLのレンダリング
  const renderXmlView = () => {
    if (!currentSlide?.xmlContent) return <div className="p-4 text-muted-foreground">XMLデータがありません</div>;
    
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md overflow-auto font-mono text-sm">
        <pre className="whitespace-pre-wrap">{currentSlide.xmlContent}</pre>
      </div>
    );
  };
  
  // フルスクリーン時のシンプル表示
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-full h-full relative">
          {slides && slides.length > 0 && currentSlideIndex < slides.length && (
            <div className="w-full h-full">
              <SlideViewer slide={slides[currentSlideIndex]} aspectRatio={undefined} />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousSlide}
                    disabled={currentSlideIndex === 0}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="mr-1" /> 前へ
                  </Button>
                  
                  <span className="text-sm">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="text-white hover:bg-white/20"
                  >
                    次へ <ChevronRight className="ml-1" />
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="mr-1" /> 戻る
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 通常表示のメインコンテンツ（PeerDiffX UIデザイン）
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* サイドバー部分 */}
      {showSidebar && (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* サイドバーヘッダー */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold">PeerDiffX</h2>
            <p className="text-xs text-muted-foreground">Presentation Version Control</p>
          </div>
          
          {/* プレゼンテーション情報 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-1">{presentation.name}</h3>
            <p className="text-xs text-muted-foreground">
              {presentation.description || 'No description'}
            </p>
          </div>
          
          {/* ナビゲーションメニュー */}
          <div className="p-4 flex-1">
            <div className="text-sm font-medium mb-2">ブランチ</div>
            {branches.map(branch => (
              <div key={branch.id} className="mb-2">
                <div className={`flex items-center p-2 rounded-md text-sm ${branch.id === defaultBranch?.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  {branch.name}
                  {branch.isDefault && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      デフォルト
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="text-sm font-medium mb-2">ツール</div>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={toggleShareModal}
              >
                <Copy className="h-4 w-4 mr-2" />
                共有
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                asChild
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  ホームに戻る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* トップヘッダー部分 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-12 flex items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => setShowSidebar(prev => !prev)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold truncate">
            {presentation.name}
          </h2>
          
          <div className="ml-auto flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleShareModal}
            >
              <Copy className="h-4 w-4 mr-1" />
              共有
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4 mr-1" />
              全画面
            </Button>
          </div>
        </div>
        
        {/* スライドとサイドパネル */}
        <div className="flex-1 flex">
          {/* 左側スライドサムネイル部分 */}
          <div className="w-60 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto hidden md:block">
            <div className="p-3">
              <div className="text-sm font-medium mb-2">スライド</div>
              <div className="grid grid-cols-1 gap-2">
                {renderSlideThumbnails()}
              </div>
            </div>
          </div>
          
          {/* 中央スライド表示部分 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* スライド数と現在位置 */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousSlide}
                  disabled={currentSlideIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  スライド {currentSlideIndex + 1}/{slides.length}
                </span>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-auto">
                  <div className="flex h-8 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                    <button
                      className={`text-xs h-7 px-2 flex items-center rounded-sm ${currentTab === "slide" ? "bg-background text-foreground" : ""}`}
                      onClick={() => setCurrentTab("slide")}
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      スライド
                    </button>
                    <button
                      className={`text-xs h-7 px-2 flex items-center rounded-sm ${currentTab === "history" ? "bg-background text-foreground" : ""}`}
                      onClick={() => setCurrentTab("history")}
                    >
                      <History className="h-3 w-3 mr-1" />
                      履歴
                    </button>
                    <button
                      className={`text-xs h-7 px-2 flex items-center rounded-sm ${currentTab === "xml" ? "bg-background text-foreground" : ""}`}
                      onClick={() => setCurrentTab("xml")}
                    >
                      <Code className="h-3 w-3 mr-1" />
                      XML
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* タブコンテンツ */}
            <div className="flex-1 overflow-hidden">
              {/* スライドタブ */}
              {currentTab === "slide" && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex justify-center items-center bg-gray-100 dark:bg-gray-900 p-4 overflow-auto">
                    <div className="aspect-[16/9] w-full max-w-4xl bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden">
                      {currentSlide && (
                        <SlideViewer 
                          slide={currentSlide} 
                          aspectRatio="16:9" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 履歴タブ */}
              {currentTab === "history" && (
                <div className="h-full overflow-auto p-4">
                  <Card className="shadow-sm mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base">コミット履歴</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        このプレゼンテーションの変更履歴を表示しています
                      </p>
                      {renderCommitHistory()}
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base">ブランチ</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        このプレゼンテーションの作業ブランチ一覧
                      </p>
                      {renderBranches()}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* XMLタブ */}
              {currentTab === "xml" && (
                <div className="h-full overflow-auto p-4">
                  <Card className="shadow-sm">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base">XMLデータ</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        現在のスライドのXML構造を表示しています
                      </p>
                      {renderXmlView()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
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