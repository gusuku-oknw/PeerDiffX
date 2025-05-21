import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ClipboardCopy, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  presentationId?: number;
  slideId?: number;
  presentationName?: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  presentationId,
  slideId,
  presentationName
}: ShareDialogProps) {
  const [title, setTitle] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // リセット関数
  const resetForm = () => {
    setTitle("");
    setExpiryDays("30");
    setIsPrivate(false);
    setIsCreating(false);
    setSnapshotId(null);
    setIsCopied(false);
  };

  // ダイアログが閉じたらステートをリセット
  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300); // アニメーション後にリセット
  };

  // スナップショットを作成
  const handleCreateSnapshot = async () => {
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
      // タイトルがなければ現在の日時を使用
      const finalTitle = title || (presentationName 
        ? `${presentationName} - 共有スナップショット` 
        : `スナップショット ${new Date().toLocaleString()}`);

      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          presentationId,
          commitId: 0, // 最新コミットを使用
          slideId,
          expiryDays: parseInt(expiryDays, 10),
          customTitle: finalTitle,
          isPrivate
        })
      });

      if (!response.ok) {
        throw new Error("スナップショット作成に失敗しました");
      }

      const result = await response.json();
      setSnapshotId(result.id);
      
      toast({
        title: "共有リンクを作成しました",
        description: "URLをコピーして共有できます",
      });
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

  // URLをコピー
  const handleCopyLink = async () => {
    if (!snapshotId) return;
    
    const url = `${window.location.origin}/snapshot/${snapshotId}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      
      toast({
        title: "コピーしました",
        description: "URLをクリップボードにコピーしました",
      });
      
      // 3秒後にコピー状態をリセット
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "エラー",
        description: "URLのコピーに失敗しました",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">プレゼンテーションを共有</DialogTitle>
          <DialogDescription>
            共有リンクを作成して、他のユーザーとプレゼンテーションを共有できます。
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="link" className="flex-1">リンク共有</TabsTrigger>
            <TabsTrigger value="embed" className="flex-1">埋め込み</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="mt-4">
            {!snapshotId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル (オプション)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={presentationName ? `${presentationName} - 共有スナップショット` : "共有スナップショット"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDays">有効期限</Label>
                  <Select
                    value={expiryDays}
                    onValueChange={setExpiryDays}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="有効期限を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1日</SelectItem>
                      <SelectItem value="7">1週間</SelectItem>
                      <SelectItem value="30">30日</SelectItem>
                      <SelectItem value="90">90日</SelectItem>
                      <SelectItem value="365">1年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    onClick={handleCreateSnapshot} 
                    disabled={isCreating}
                    className="w-full"
                  >
                    {isCreating ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⟳</span> 作成中...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Share2 className="mr-2 h-4 w-4" /> 共有リンクを作成
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">共有リンク:</p>
                  <div className="flex">
                    <Input
                      readOnly
                      value={`${window.location.origin}/snapshot/${snapshotId}`}
                      className="bg-white dark:bg-gray-700"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="ml-2"
                      onClick={handleCopyLink}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  このリンクは{expiryDays}日間有効です。期限後はアクセスできなくなります。
                </p>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="w-full"
                  >
                    新しいリンクを作成
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="embed" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                以下のコードをWebサイトに埋め込むことで、プレゼンテーションを表示できます。
              </p>
              
              <Textarea
                readOnly
                className="h-24 font-mono text-sm"
                value={`<iframe src="${window.location.origin}/embed/${presentationId}/${slideId}" width="100%" height="500" frameborder="0" allow="fullscreen"></iframe>`}
              />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `<iframe src="${window.location.origin}/embed/${presentationId}/${slideId}" width="100%" height="500" frameborder="0" allow="fullscreen"></iframe>`
                    );
                    toast({
                      title: "コピーしました",
                      description: "埋め込みコードをクリップボードにコピーしました",
                    });
                  } catch (error) {
                    toast({
                      title: "エラー",
                      description: "埋め込みコードのコピーに失敗しました",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <ClipboardCopy className="mr-2 h-4 w-4" /> 埋め込みコードをコピー
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose}>
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}