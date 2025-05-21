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
        variant="ghost" 
        size="icon"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        title="AI分析"
      >
        <FaRobot className="h-4 w-4" />
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