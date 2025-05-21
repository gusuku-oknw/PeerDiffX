import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AiAnalysisPanel } from "./ai-analysis-panel";
import { FaRobot, FaBrain, FaChartBar } from "react-icons/fa";

interface AiAnalysisButtonProps {
  presentationId: number;
  commitId: number;
}

export function AiAnalysisButton({ presentationId, commitId }: AiAnalysisButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-300 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 dark:border-blue-800 dark:text-blue-400"
      >
        <FaRobot className="h-4 w-4" />
        <span>AI分析</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FaBrain className="mr-2 text-blue-600" />
              AI分析ダッシュボード
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AiAnalysisPanel presentationId={presentationId} commitId={commitId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}