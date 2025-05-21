import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2 } from "lucide-react";
import { ShareDialog } from "@/components/share/share-dialog";
import { OneClickSnapshotButton } from "./one-click-snapshot-button";

interface ShareButtonProps {
  presentationId: number;
  slideId: number;
  commitId?: number;
  presentationName?: string;
  className?: string;
}

export function ShareButton({
  presentationId,
  slideId,
  commitId,
  presentationName,
  className
}: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = React.useState(false);

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" /> 共有
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
            詳細オプションで共有
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <OneClickSnapshotButton
              presentationId={presentationId}
              slideId={slideId}
              presentationName={presentationName}
              variant="ghost"
              size="sm"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showShareDialog && (
        <ShareDialog
          presentationId={presentationId}
          slideId={slideId}
          commitId={commitId || 0}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}