import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { useSlide, usePresentation, useSlides } from '@/hooks/use-pptx';
import { decodeId, encodeId } from '@/lib/hash-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FaLayerGroup, FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus, FaExpand, FaCode, FaHistory, FaComments, FaCodeBranch, FaTimes, FaLock } from 'react-icons/fa';
import { Home, Settings, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, GitCompare, History } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SlideCanvas from '@/components/slides/slide-canvas';
import SlideThumbnails from '@/components/slides/slide-thumbnails';
import { SlideControls } from '@/components/slides/slide-controls';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * 元のデザインに近づけたプレゼンテーションプレビュー
 * レイアウト問題を解決しつつ、既存のコンポーネントを活用
 */
export default function PublicPreview() {
  const [, params] = useRoute<{ presentationId: string; commitId?: string }>('/public-preview/:presentationId/:commitId?');
  
  // デバッグ情報をコンソールに出力
  console.log('Original hash from URL:', params?.presentationId);
  
  // 正しいデコード方法を使用
  const presentationId = params?.presentationId ? 
    decodeId(params.presentationId) || 12 
    : 12;
  
  console.log('Decoded presentationId:', presentationId);
  
  // commitIdの処理
  const commitId = params?.commitId ? parseInt(params.commitId, 10) : 35;
  console.log('Using commitId:', commitId);
  
  // URLが通常の数値IDだった場合は、エンコードしたURLにリダイレクト
  useEffect(() => {
    if (params?.presentationId && !isNaN(Number(params.presentationId)) && !params.presentationId.startsWith('pdx-')) {
      const encodedId = encodeId(Number(params.presentationId));
      window.location.href = `/public-preview/${encodedId}${params.commitId ? `/${params.commitId}` : ''}`;
    }
  }, [params]);
  
  // プレゼンテーション情報を取得
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  
  // スライド情報を取得
  const { data: slides = [], isLoading: isLoadingSlides } = useSlides(commitId);
  
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCreatingDefaultSlide, setIsCreatingDefaultSlide] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'locks' | 'ai'>('comments');
  const [panelHeight, setPanelHeight] = useState(240); // 初期パネル高さ(px)
  
  // リサイズ関連の状態
  const resizeRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  
  // トーストの状態を管理
  const { toast } = useToast();

  // よりシンプルなアプローチでのスライド表示
  // 既存のコードでエラーが発生するため、デフォルトサンプルスライドを用意
  const sampleSlide = {
    id: 9999,
    title: "Q4 Presentation",
    slideNumber: 1,
    content: {
      elements: [
        {
          type: "text",
          x: 50,
          y: 200,
          content: "Q4 Presentation",
          style: {
            fontSize: 42,
            fontWeight: "bold",
            color: "#000000"
          }
        },
        {
          type: "text",
          x: 50,
          y: 280,
          content: "Company Overview and Results",
          style: {
            fontSize: 24,
            color: "#444444"
          }
        },
        {
          type: "text",
          x: 50,
          y: 400,
          content: new Date().toLocaleDateString('ja-JP'),
          style: {
            fontSize: 16,
            color: "#666666"
          }
        }
      ]
    }
  };

  // 最初のスライドが読み込まれたら選択、スライドがなければサンプルスライドを表示
  useEffect(() => {
    if (!isLoadingSlides) {
      if (slides?.length > 0) {
        // 実際のスライドがある場合はそれを表示
        setCurrentSlideId(slides[0].id);
        setCurrentSlideIndex(0);
      } else {
        // スライドがない場合はサンプルスライドを使用（IDをnull以外に設定）
        setCurrentSlideId(sampleSlide.id);
        setCurrentSlideIndex(0);
      }
    }
  }, [slides, isLoadingSlides]);
  
  // 選択したスライドが変更されたら状態を更新
  useEffect(() => {
    // 実際のスライドから選択されたIDをチェック
    if (currentSlideId !== sampleSlide.id && slides?.length > 0) {
      const index = slides.findIndex((s: any) => s.id === currentSlideId);
      if (index !== -1) {
        setCurrentSlideIndex(index);
      }
    }
  }, [currentSlideId, slides]);

  // スライド選択ハンドラ
  const handleSelectSlide = (slideId: number) => {
    setCurrentSlideId(slideId);
  };

  // 前/次のスライドに移動
  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      const prevSlide = slides[currentSlideIndex - 1];
      setCurrentSlideId(prevSlide.id);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextSlide = slides[currentSlideIndex + 1];
      setCurrentSlideId(nextSlide.id);
    }
  };

  // XMLディフを表示
  const handleViewXmlDiff = () => {
    setActiveTab('history');
    setShowBottomPanel(true);
    console.log("差分表示を開きました");
  };
  
  // 履歴を表示
  const handleViewHistory = () => {
    setActiveTab('history');
    setShowBottomPanel(true);
  };
  
  // ボトムパネルのリサイズ処理
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(100, Math.min(window.innerHeight * 0.7, startHeightRef.current + deltaY));
    setPanelHeight(newHeight);
  };

  const handleResizeEnd = () => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideIndex, slides]);

  // ローディング表示
  if (isLoadingPresentation || !presentation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <Skeleton className="h-8 w-1/2 rounded-md" />
          <Skeleton className="h-32 w-full rounded-md mt-4" />
        </div>
      </div>
    );
  }

  // メインコンテンツのレンダリング - 元のデザインに近づける
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
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
          <Button asChild size="sm" variant="ghost">
            <Link href="/">
              <Home className="mr-1.5 h-3.5 w-3.5" />
              ホーム
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings">
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              設定
            </Link>
          </Button>
        </div>
      </div>

      {/* メインコンテンツ - 3カラムレイアウト */}
      <div style={{
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* 左側サイドバー - プレゼンテーション情報 */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
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
            
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">ブランチ</h3>
              <div className="space-y-1 mt-2">
                <div className="flex items-center px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
                  <span className="font-medium">main</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">コミット履歴</h3>
              <div className="space-y-1 mt-2">
                <div className="flex items-center px-3 py-2 rounded-md text-sm bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Initial commit
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        {/* 中央サムネイル表示部分 - 既存のコンポーネントを使用 */}
        <SlideThumbnails 
          commitId={commitId}
          activeSlideId={currentSlideId || undefined}
          onSelectSlide={handleSelectSlide}
          slides={slides}
        />
        
        {/* メインスライド表示エリア - スライドキャンバスの問題を回避するためにシンプルに実装 */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden" style={{ minWidth: 0 }}>
          {currentSlideId ? (
            <div className="h-full flex flex-col">
              {/* スライド操作ツールバー - 既存のSlideControlsコンポーネントを使用 */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
                {/* 左側：スライドナビゲーション */}
                <div className="flex items-center space-x-2 mr-auto">
                  <div className="flex items-center space-x-1 mr-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPreviousSlide}
                      disabled={currentSlideIndex <= 0}
                      title="前のスライド"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-sm font-medium mx-2">
                      {currentSlideIndex + 1} / {slides.length || 1}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextSlide}
                      disabled={currentSlideIndex >= (slides.length - 1)}
                      title="次のスライド"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleViewHistory} title="履歴を表示">
                      <History className="h-4 w-4 mr-1" /> 履歴
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleViewXmlDiff} title="差分を表示">
                      <GitCompare className="h-4 w-4 mr-1" /> 差分
                    </Button>
                  </div>
                </div>
                
                {/* 右側：追加のアクション */}
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <FaSearchMinus className="h-3.5 w-3.5 mr-1" /> 縮小
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">100%</span>
                  <Button size="sm" variant="ghost">
                    <FaSearchPlus className="h-3.5 w-3.5 mr-1" /> 拡大
                  </Button>
                  <div className="h-6 border-l border-gray-200 dark:border-gray-700 mx-1"></div>
                  <Button size="sm" variant="ghost">
                    <FaExpand className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="ml-2">
                    <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
                      <FaCodeBranch className="mr-1.5 h-3.5 w-3.5" /> Commit
                    </span>
                  </Button>
                </div>
              </div>
              
              {/* スライド表示エリア */}
              <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                {currentSlideId === sampleSlide.id ? (
                  // サンプルスライドを表示
                  <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm" style={{ aspectRatio: '16/9' }}>
                    <div className="p-12 h-full relative flex flex-col items-center justify-center">
                      <h1 className="text-4xl font-bold mb-6 text-center">{sampleSlide.title}</h1>
                      <div className="w-20 h-1 bg-blue-500 mb-8"></div>
                      <p className="text-xl text-gray-600 dark:text-gray-300 text-center">Company Overview and Results</p>
                      <div className="mt-12 text-sm text-gray-500">{new Date().toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>
                ) : slides[currentSlideIndex] ? (
                  // 実際のスライドを表示
                  <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm" style={{ aspectRatio: '16/9' }}>
                    <div className="p-8 h-full relative">
                      <h2 className="text-3xl font-bold">{slides[currentSlideIndex].title || 'タイトルなし'}</h2>
                      {slides[currentSlideIndex].content && 
                       typeof slides[currentSlideIndex].content === 'object' &&
                       'elements' in slides[currentSlideIndex].content &&
                       Array.isArray(slides[currentSlideIndex].content.elements) &&
                       slides[currentSlideIndex].content.elements.map((element: any, idx: number) => (
                         element.type === 'text' && (
                           <p key={idx} style={{
                             position: 'absolute',
                             left: `${element.x}px`,
                             top: `${element.y}px`,
                             color: element.style?.color || '#000',
                             fontSize: `${element.style?.fontSize || 16}px`,
                             fontWeight: element.style?.fontWeight || 'normal',
                           }}>
                             {element.content}
                           </p>
                         )
                       ))
                     }
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">スライドデータを読み込み中...</p>
                )}
              </div>
              
              {/* ボトムパネル - VSCode風のパネル */}
              {showBottomPanel && (
                <div className="flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700" style={{ height: `${panelHeight}px` }}>
                  {/* リサイズ用のグラブバー */}
                  <div 
                    ref={resizeRef}
                    className="h-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-700 cursor-ns-resize group flex justify-center items-center"
                    onMouseDown={handleResizeStart}
                  >
                    <div className="w-8 h-1 bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 rounded-full transform scale-75 group-hover:scale-100 transition-all"></div>
                  </div>
                  
                  {/* タブメニューとコンテンツ */}
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                      <TabsList className="bg-transparent p-0">
                        <TabsTrigger 
                          value="comments" 
                          className="px-3 py-1 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                        >
                          <FaComments className="mr-2 h-4 w-4" />
                          コメント
                        </TabsTrigger>
                        <TabsTrigger 
                          value="history" 
                          className="px-3 py-1 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                        >
                          <FaHistory className="mr-2 h-4 w-4" />
                          履歴
                        </TabsTrigger>
                        <TabsTrigger 
                          value="locks" 
                          className="px-3 py-1 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                        >
                          <FaLock className="mr-2 h-4 w-4" />
                          ロック状況
                        </TabsTrigger>
                      </TabsList>
                      
                      <Button 
                        onClick={() => setShowBottomPanel(false)}
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <FaTimes className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    {/* タブコンテンツ */}
                    <div className="p-4 overflow-y-auto" style={{ height: `${panelHeight - 50}px` }}>
                      <TabsContent value="comments" className="m-0 p-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">スライド {currentSlideIndex + 1} のコメント</h3>
                          <Button variant="outline" size="sm" className="text-xs">
                            <FaComments className="mr-1.5 h-3 w-3" />
                            新規コメント
                          </Button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                          <p className="text-sm text-gray-500 dark:text-gray-400">このスライドにはまだコメントがありません。</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="history" className="m-0 p-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">バージョン履歴</h3>
                          <div className="text-xs text-gray-500">
                            <span>最終更新: {new Date().toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border-l-2 border-blue-500">
                            <div className="flex justify-between">
                              <span className="font-medium">初期バージョン</span>
                              <span className="text-xs text-gray-500">{new Date().toLocaleDateString('ja-JP')}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              プレゼンテーションを作成しました。
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="locks" className="m-0 p-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">ファイルロック状況</h3>
                          <Button variant="outline" size="sm" className="text-xs">
                            <FaLock className="mr-1.5 h-3 w-3" />
                            現在のスライドをロック
                          </Button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                          <p className="text-sm text-gray-500 dark:text-gray-400">現在ロックされているスライドはありません。</p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">スライドを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}