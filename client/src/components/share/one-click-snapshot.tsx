import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2, Check } from "lucide-react";

interface OneClickSnapshotProps {
  presentationId: number;
  slideId: number;
  presentationName?: string;
  className?: string;
}

/**
 * ワンクリックでスナップショットを作成し、URLをコピーするボタン
 */
export function OneClickSnapshot({
  presentationId,
  slideId,
  presentationName,
  className
}: OneClickSnapshotProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCreateAndCopy = async () => {
    if (!presentationId || !slideId) {
      toast({
        title: "エラー",
        description: "プレゼンテーションIDまたはスライドIDが不正です",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // 現在の日時をタイトルに追加
      const now = new Date();
      const dateStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
      const title = presentationName 
        ? `${presentationName} - ${dateStr}` 
        : `スナップショット ${dateStr}`;

      // 30日間有効なスナップショットを作成
      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          presentationId,
          commitId: 0, // 最新コミットを使用
          slideId,
          expiryDays: 30,
          customTitle: title
        })
      });

      if (!response.ok) {
        throw new Error("スナップショット作成に失敗しました");
      }

      const result = await response.json();
      const snapshotUrl = `${window.location.origin}/preview/pdx-${result.id}`;

      // URLをクリップボードにコピー
      await navigator.clipboard.writeText(snapshotUrl);
      setIsCopied(true);

      // 成功通知
      toast({
        title: "共有リンクを作成しました",
        description: "URLをクリップボードにコピーしました",
      });

      // 3秒後にコピー状態をリセット
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error("スナップショット作成エラー:", error);
      toast({
        title: "エラー",
        description: "スナップショットの作成に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      onClick={handleCreateAndCopy}
      disabled={isCreating}
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 mr-2" /> コピー完了
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" /> ワンクリック共有
        </>
      )}
    </Button>
  );
}