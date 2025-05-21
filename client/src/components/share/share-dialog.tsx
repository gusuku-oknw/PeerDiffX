import React, { useState } from 'react';
import { useLanguage } from '@/components/i18n/language-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaShare, FaLink, FaCopy, FaTwitter, FaFacebook, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  presentationId: number;
  commitId: number;
  slideId?: number;
  onClose?: () => void;
}

export function ShareDialog({ presentationId, commitId, slideId, onClose }: ShareDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  
  // 共有用のURLを生成する関数
  const generateShareableLink = async () => {
    setIsGenerating(true);
    
    try {
      // サーバーに共有スナップショットの作成をリクエスト
      const response = await fetch('/api/snapshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presentationId,
          commitId,
          slideId,
          expiryDays: parseInt(expiryDays, 10)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create snapshot');
      }
      
      const data = await response.json();
      
      // 生成されたスナップショットのURLを設定
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/snapshot/${data.id}`);
    } catch (error) {
      console.error('Error generating shareable link:', error);
      toast({
        title: t('shareError'),
        description: t('shareErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // コピーボタンのハンドラー
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: t('copied'),
        description: t('urlCopied'),
      });
    });
  };
  
  // ダイアログが開かれたときに共有URLを生成
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !shareUrl) {
      generateShareableLink();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FaShare className="mr-2" />
          <span>{t('share')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sharePresentation')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="expiryDays" className="w-24">
              {t('expiryDays')}:
            </Label>
            <select
              id="expiryDays"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="1">1 {t('day')}</option>
              <option value="7">7 {t('days')}</option>
              <option value="30">30 {t('days')}</option>
              <option value="90">90 {t('days')}</option>
            </select>
          </div>
          
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <Input
              id="shareUrl"
              readOnly
              value={isGenerating ? t('generating') : shareUrl}
              className="col-span-1"
            />
            <Button type="button" onClick={handleCopy} disabled={isGenerating || !shareUrl} size="icon">
              <FaCopy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-2 pt-4">
            <Button
              variant="outline"
              size="icon"
              disabled={isGenerating || !shareUrl}
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}
            >
              <FaTwitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={isGenerating || !shareUrl}
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
            >
              <FaFacebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={isGenerating || !shareUrl}
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
            >
              <FaLinkedin className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={isGenerating || !shareUrl}
              onClick={() => window.open(`mailto:?subject=${t('checkOutPresentation')}&body=${encodeURIComponent(shareUrl)}`, '_blank')}
            >
              <FaEnvelope className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}