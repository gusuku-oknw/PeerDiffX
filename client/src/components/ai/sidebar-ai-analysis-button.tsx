import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AiAnalysisPanel } from "./ai-analysis-panel";
import { FaRobot, FaBrain } from "react-icons/fa";

interface SidebarAiAnalysisButtonProps {
  presentationId: number;
  commitId?: number; // オプショナルに変更
}

export function SidebarAiAnalysisButton({ presentationId, commitId = 0 }: SidebarAiAnalysisButtonProps) {
  const [open, setOpen] = useState(false);
  
  // シンプルな実装に変更（コミットID取得は複雑すぎるのでAI分析パネル側に任せる）
  const effectiveCommitId = commitId || 0;

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
          <FaRobot className="text-xs" />
        </div>
        <span>AI分析</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FaBrain className="mr-2 text-blue-600" />
              AI分析ダッシュボード
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AiAnalysisPanel presentationId={presentationId} commitId={effectiveCommitId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}