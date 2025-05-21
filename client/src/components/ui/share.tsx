import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Share as ShareIcon, X } from "lucide-react";
import { FaTwitter, FaFacebook, FaLinkedin, FaEnvelope } from "react-icons/fa";

interface ShareProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function Share({ isOpen, onClose, url, title }: ShareProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShareIcon className="w-5 h-5 mr-2" />
            プレゼンテーションを共有
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 p-0 w-7 h-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="p-4">
          <div className="mb-4">
            <Label htmlFor="link" className="text-sm font-medium mb-1.5 block">
              共有リンク
            </Label>
            <div className="flex items-center">
              <Input
                id="link"
                readOnly
                value={url}
                className="flex-1 pr-10"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="ml-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <Label className="text-sm font-medium mb-3 block">
              SNSで共有
            </Label>
            <div className="flex space-x-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="mr-2 h-4 w-4" />
                  Twitter
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="mr-2 h-4 w-4" />
                  Facebook
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={mailUrl} target="_blank" rel="noopener noreferrer">
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  メール
                </a>
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <Label className="text-sm font-medium mb-1.5 block">
              権限設定
            </Label>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              このプレゼンテーションの閲覧権限は「公開」に設定されています。リンクを持つ全ての人が閲覧可能です。
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}