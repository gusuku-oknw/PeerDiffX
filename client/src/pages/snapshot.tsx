import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useSlide } from "@/hooks/use-pptx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import SlideCanvas from "@/components/slides/slide-canvas";

export default function SnapshotPage() {
  const [, params] = useRoute("/preview/pdx-:id");
  const snapshotId = params?.id;
  
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSnapshot() {
      if (!snapshotId) {
        setError("スナップショットIDが見つかりません");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/snapshots/${snapshotId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("スナップショットが見つかりません");
          } else if (response.status === 410) {
            setError("このスナップショットは有効期限が切れています");
          } else {
            setError("スナップショットの読み込みに失敗しました");
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setSnapshot(data);
      } catch (err) {
        console.error("スナップショット取得エラー:", err);
        setError("スナップショットの読み込み中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSnapshot();
  }, [snapshotId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-4 px-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-red-500 dark:text-red-400 text-4xl mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center">{error}</h2>
              <p className="text-center text-gray-500 dark:text-gray-400">
                このリンクは無効か期限切れです。新しいスナップショットの作成をお願いします。
              </p>
              <Link href="/">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> ホームに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!snapshot) {
    return null;
  }
  
  const { slideId, title, presentationId } = snapshot;
  const expiryDate = new Date(snapshot.expiresAt).toLocaleDateString();
  
  // ダミーのスライド機能
  const currentSlideNumber = 1;
  const totalSlides = 1;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> ホームに戻る
            </Button>
          </Link>
          <h1 className="text-xl font-bold truncate max-w-[600px]">{title || "共有スナップショット"}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> ダウンロード
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>プレゼンテーションをダウンロード</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {presentationId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/preview/${presentationId}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" /> プレゼンテーションを開く
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>プレゼンテーションの詳細を表示</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          スナップショット有効期限: {expiryDate}
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SlideCanvas
            slideId={slideId}
            totalSlides={totalSlides}
            currentSlideNumber={currentSlideNumber}
            onPrevSlide={() => {}}
            onNextSlide={() => {}}
            onViewXmlDiff={() => {}}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-gray-500 dark:text-gray-400">
        PeerDiffX スナップショット | 共有リンクから訪問中
      </footer>
    </div>
  );
}