import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createSnapshot, getShareableUrl, copyToClipboard } from "@/features/share/snapshot-service";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Share2, Check, Link } from "lucide-react";

interface SnapshotButtonProps {
  presentationId: number;
  slideId: number;
  presentationName?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SnapshotButton({
  presentationId,
  slideId,
  presentationName,
  className,
  variant = "outline",
  size = "default"
}: SnapshotButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // スナップショットを作成する
  const handleCreateSnapshot = async () => {
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
      // 初期ダイアログを表示
      setDialogOpen(true);
      
      // デフォルトのタイトル
      if (presentationName && !customTitle) {
        setCustomTitle(`${presentationName} - スナップショット`);
      }
    } catch (error) {
      toast({
        title: "スナップショット作成エラー",
        description: "スナップショットの作成中にエラーが発生しました。",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // スナップショットの実際の作成処理
  const handleConfirmCreate = async () => {
    setIsCreating(true);
    
    try {
      const snapshot = await createSnapshot(
        presentationId,
        slideId,
        customTitle || undefined
      );
      
      if (snapshot) {
        const url = getShareableUrl(snapshot.id);
        setSnapshotUrl(url);
        
        toast({
          title: "スナップショット作成成功",
          description: "スナップショットが正常に作成されました。",
        });
      } else {
        throw new Error("スナップショット作成失敗");
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "スナップショットの作成に失敗しました。",
        variant: "destructive"
      });
      setDialogOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  // URLをクリップボードにコピー
  const handleCopyUrl = async () => {
    const success = await copyToClipboard(snapshotUrl);
    
    if (success) {
      setIsCopied(true);
      toast({
        title: "コピー完了",
        description: "リンクがクリップボードにコピーされました。",
      });
      
      // 3秒後にコピー状態をリセット
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } else {
      toast({
        title: "コピー失敗",
        description: "リンクのコピーに失敗しました。",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={className}
              onClick={handleCreateSnapshot}
              disabled={isCreating}
            >
              <Share2 className="w-4 h-4 mr-1" /> 共有
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>スナップショットを作成して共有</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>プレゼンテーションを共有</DialogTitle>
          </DialogHeader>
          
          {!snapshotUrl ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  タイトル
                </Label>
                <Input
                  id="title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="スナップショットのタイトル"
                />
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={handleConfirmCreate} disabled={isCreating}>
                  {isCreating ? "作成中..." : "スナップショットを作成"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    リンク
                  </Label>
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-gray-400" />
                    <Input
                      id="link"
                      readOnly
                      value={snapshotUrl}
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="px-3"
                  onClick={handleCopyUrl}
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">コピー</span>
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                >
                  閉じる
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}