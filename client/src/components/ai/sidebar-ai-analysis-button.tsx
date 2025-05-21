import { useState } from "react";
import { FaBrain } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AiAnalysisPanel } from "./ai-analysis-panel";

interface SidebarAiAnalysisButtonProps {
  presentationId: number;
  commitId?: number;
}

export function SidebarAiAnalysisButton({ presentationId, commitId }: SidebarAiAnalysisButtonProps) {
  const [open, setOpen] = useState(false);
  
  // 実効コミットIDを決定（commitIdが指定されていない場合は自動的に最新のコミットを使用）
  const effectiveCommitId = commitId || 0;
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="mb-1 flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <FaBrain className="text-blue-600 dark:text-blue-400" />
        </div>
        <span>AI分析</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="dialog-content-fix p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center">
              <FaBrain className="mr-2 text-blue-600" />
              AI分析ダッシュボード
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            <AiAnalysisPanel presentationId={presentationId} commitId={effectiveCommitId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}