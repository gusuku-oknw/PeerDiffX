import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share as ShareIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function Share({ isOpen, onClose, title, url }: ShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // URLをクリップボードにコピー
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "URLをコピーしました",
        description: "共有リンクがクリップボードにコピーされました。",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "コピーに失敗しました",
        description: "リンクのコピーに失敗しました。手動でコピーしてください。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>プレゼンテーションを共有</DialogTitle>
          <DialogDescription>
            以下のリンクを共有して、他の人とプレゼンテーションを見ることができます。
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-2">
          <div className="grid flex-1 gap-2">
            <label htmlFor="link" className="sr-only">共有リンク</label>
            <Input
              id="link"
              value={url}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <Button 
            size="sm" 
            className="px-3" 
            onClick={copyToClipboard}
            variant="secondary"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">リンクをコピー</span>
          </Button>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">他の共有方法</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                window.open(`mailto:?subject=${encodeURIComponent(`${title} - 共有プレゼンテーション`)}&body=${encodeURIComponent(`${title}をご覧ください: ${url}`)}`, "_blank");
              }}
            >
              <ShareIcon className="mr-2 h-4 w-4" />
              メールで送信
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                const tweetText = `${title} ${url}`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank");
              }}
            >
              <ShareIcon className="mr-2 h-4 w-4" />
              Xで共有
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-start mt-6">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onClose}>
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}