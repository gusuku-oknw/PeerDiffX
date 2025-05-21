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
import { decodeId } from "@/lib/hash-utils";

export default function Preview() {
  const [, params] = useRoute("/preview/:id");
  
  // すべてのstate変数を最初に宣言
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
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  
  // URL hash parameter から presentation ID を復元
  let presentationId = 0;
  
  try {
    // 通常の数値IDの場合（ハッシュ化前のURL）
    if (params?.id && !isNaN(parseInt(params.id))) {
      presentationId = parseInt(params.id);
    } 
    // ハッシュ化されたIDの場合
    else if (params?.id) {
      const decodedId = decodeId(params.id);
      if (decodedId !== null) {
        presentationId = decodedId;
      }
    }
  } catch (error) {
    console.error("Failed to decode presentation ID:", error);
  }
  
  // すべてのデータ取得処理を一箇所にまとめる
  const { data: presentation, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: defaultBranch, isLoading: isLoadingBranch } = useBranch(presentationId, true);
  const { data: commits, isLoading: isLoadingCommits } = useCommits(defaultBranch?.id);
  
  const latestCommit = commits?.[0];
  const { data: slides, isLoading: isLoadingSlides } = useSlides(latestCommit?.id);
  
  // すべてのuseEffectを集約
  // 1. スライドが読み込まれたら、最初のスライドをアクティブにする
  useEffect(() => {
    console.log("スライド読み込み状態:", slides);
    if (slides && slides.length > 0) {
      console.log("スライドが見つかりました、ID設定:", slides[0].id);
      setActiveSlideId(slides[0].id);
    }
  }, [slides]);
  
  // 2. データが不完全な場合の処理
  useEffect(() => {
    // ブランチが見つからない問題を処理
    if (isAutoRefreshEnabled && presentation) {
      if (!defaultBranch) {
        console.log("デフォルトブランチが見つかりません。作成を試みます...");
        
        // ブランチがない場合は作成を試みる
        const createDefaultBranch = async () => {
          try {
            const response = await fetch("/api/branches", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                name: "main",
                description: "Default branch",
                presentationId: presentation.id,
                isDefault: true
              })
            });
            
            if (response.ok) {
              console.log("デフォルトブランチを作成しました。リロードします...");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              console.error("ブランチ作成に失敗しました");
            }
          } catch (error) {
            console.error("ブランチ作成エラー:", error);
          }
        };
        
        // 3秒後に実行して他の初期化処理が完了する時間を確保
        const timer = setTimeout(() => {
          createDefaultBranch();
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [presentation, defaultBranch, isAutoRefreshEnabled]);
  
  // 3. コミットがあるのにスライドがない場合の対応
  useEffect(() => {
    if (isAutoRefreshEnabled && latestCommit && (!slides || slides.length === 0)) {
      console.log("スライドがありません。コミットは存在します。スライドチェック...");
      
      const checkAndCreateSlides = async () => {
        try {
          // まず、キャッシュを回避してスライドデータを再度取得する
          console.log("スライドを再確認中...");
          const timestamp = new Date().getTime();
          const checkResponse = await fetch(`/api/commits/${latestCommit.id}/slides?nocache=${timestamp}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (checkResponse.ok) {
            const slideData = await checkResponse.json();
            console.log("再確認したスライドデータ:", slideData);
            
            // スライドが既に存在する場合は、再ロードするだけ
            if (slideData && slideData.length > 0) {
              console.log("スライドが見つかりました。表示を更新します...");
              // スライドが見つかったのでstateを更新するだけ
              return;
            }
            
            // スライドが本当に存在しない場合のみ、作成処理に進む
            console.log("スライドが確実に存在しません。作成処理に進みます...");
            
            // スライド自動作成APIを呼び出す
            const createResponse = await fetch(`/api/commits/${latestCommit.id}/create-slides`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                slideCount: 1,
                title: "Welcome"
              })
            });
            
            if (createResponse.ok) {
              console.log("スライドを自動作成しました。");
              // ここでリロードしなくてもuseQueryによってデータが再取得される
            } else {
              // 通常のスライド作成APIを使用
              console.log("スライド作成APIを使用します...");
              
              const defaultContent = {
                elements: [
                  {
                    id: "title1",
                    type: "text",
                    x: 100,
                    y: 100,
                    width: 600,
                    height: 100,
                    content: "テスト",
                    style: { 
                      fontSize: 32, 
                      fontWeight: "bold", 
                      color: "#333333" 
                    }
                  },
                  {
                    id: "subtitle1",
                    type: "text",
                    x: 100,
                    y: 220,
                    width: 600,
                    height: 50,
                    content: "Created with PeerDiffX",
                    style: { 
                      fontSize: 24, 
                      color: "#666666" 
                    }
                  }
                ],
                background: "#ffffff"
              };

              await fetch("/api/slides", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  commitId: latestCommit.id,
                  slideNumber: 1,
                  title: "Welcome",
                  content: defaultContent,
                  xmlContent: "<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>テスト</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Created with PeerDiffX</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>"
                })
              });
              
              console.log("スライドを手動作成しました。再取得します...");
            }
          }
        } catch (error) {
          console.error("スライド確認/作成エラー:", error);
        }
      };
      
      // 少し遅延させて実行（他の処理が完了する時間を確保）
      const timer = setTimeout(checkAndCreateSlides, 2000);
      return () => clearTimeout(timer);
    }
  }, [latestCommit, slides, isAutoRefreshEnabled]);
  
  // 4. デバッグ用に状態をログ出力
  useEffect(() => {
    console.log("現在の状態:", {
      presentationId,
      defaultBranch,
      latestCommit,
      slides: slides?.length,
      activeSlideId
    });
  }, [presentationId, defaultBranch, latestCommit, slides, activeSlideId]);
  
  // イベントハンドラの定義
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
  
  // ローディング状態の判定
  const isLoading = isLoadingPresentation || isLoadingBranch || isLoadingCommits || isLoadingSlides;

  // ローディング表示
  if (isLoading) {
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
  
  // プレゼンテーションが存在しない場合
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
  
  // メインコンテンツを返す
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar onToggleVersionPanel={toggleVersionPanel} />
      
      {activeSlideId ? (
        <>
          <SlideThumbnails 
            commitId={latestCommit?.id} 
            activeSlideId={activeSlideId} 
            onSelectSlide={handleSelectSlide} 
          />
          
          <SlideCanvas 
            slideId={activeSlideId}
            totalSlides={slides?.length || 0}
            currentSlideNumber={activeSlide?.slideNumber || 1}
            onPrevSlide={handlePrevSlide}
            onNextSlide={handleNextSlide}
            onViewXmlDiff={handleViewXmlDiff}
            onViewHistory={handleViewHistory}
            shareDialogComponent={
              <ShareDialog 
                presentationId={presentationId} 
                commitId={latestCommit?.id} 
                slideId={activeSlideId} 
              />
            }
          />
          
          {/* バージョン履歴パネルはサイドパネルに統合しました */}
        </>
      ) : (
        // アクティブスライドがない場合は読み込み中表示
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">スライドを読み込み中...</h2>
            <div className="flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
        </div>
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
