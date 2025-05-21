import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createSnapshot, getShareableUrl, copyToClipboard } from "@/features/share/snapshot-service";
import { useToast } from "@/hooks/use-toast";
import { Share2, Check } from "lucide-react";

interface OneClickSnapshotButtonProps {
  presentationId: number;
  slideId: number;
  presentationName?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * ワンクリックでスナップショットを作成するボタン
 */
export function OneClickSnapshotButton({
  presentationId,
  slideId,
  presentationName,
  className,
  variant = "outline",
  size = "sm"
}: OneClickSnapshotButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // スナップショットを作成して直接URLをコピー
  const handleCreateAndCopy = async () => {
    if (!presentationId || !slideId) {
      toast({
        title: "エラー",
        description: "プレゼンテーションまたはスライドIDが不正です。",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // デフォルトのタイトル
      const title = presentationName 
        ? `${presentationName} - スナップショット` 
        : "プレゼンテーションスナップショット";
      
      // スナップショット作成
      const snapshot = await createSnapshot(
        presentationId,
        slideId,
        title
      );
      
      if (snapshot) {
        const url = getShareableUrl(snapshot.id);
        
        // URLをクリップボードにコピー
        const success = await copyToClipboard(url);
        
        if (success) {
          setIsCopied(true);
          toast({
            title: "スナップショット作成成功",
            description: "共有リンクをクリップボードにコピーしました。",
          });
          
          // 3秒後にコピー状態をリセット
          setTimeout(() => {
            setIsCopied(false);
          }, 3000);
        } else {
          toast({
            title: "コピー失敗",
            description: "リンクは作成されましたが、コピーできませんでした。",
          });
        }
      } else {
        throw new Error("スナップショット作成失敗");
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "スナップショットの作成に失敗しました。",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleCreateAndCopy}
            disabled={isCreating}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-1" /> コピー済み
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-1" /> ワンクリック共有
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>スナップショットを作成してリンクをコピー</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}