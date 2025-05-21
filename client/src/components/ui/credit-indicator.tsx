import React from "react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaUserGraduate } from "react-icons/fa";

interface CreditIndicatorProps {
  totalCredits: number;
  usedCredits: number;
  className?: string;
}

export function CreditIndicator({ 
  totalCredits, 
  usedCredits, 
  className 
}: CreditIndicatorProps) {
  const remainingCredits = totalCredits - usedCredits;
  const percentageUsed = (usedCredits / totalCredits) * 100;
  
  // ステータスの計算
  let statusColor = "bg-green-500";
  let statusText = "充分なレビュー枠があります";
  
  if (percentageUsed > 90) {
    statusColor = "bg-red-500";
    statusText = "レビュー枠がわずかしか残っていません";
  } else if (percentageUsed > 70) {
    statusColor = "bg-yellow-500";
    statusText = "レビュー枠が残り少なくなっています";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800", className)}>
            <FaUserGraduate className="text-blue-500" />
            <div className="flex flex-col">
              <div className="text-xs font-medium">学生レビュー枠</div>
              <div className="flex items-center gap-1">
                <div className="text-sm font-semibold">{remainingCredits}</div>
                <div className="text-xs text-gray-500">/ {totalCredits}</div>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full ml-1 animate-pulse" style={{ backgroundColor: statusColor === "bg-green-500" ? "#10B981" : statusColor === "bg-yellow-500" ? "#F59E0B" : "#EF4444" }}></div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="p-1">
            <div className="text-sm font-medium mb-1">{statusText}</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs">使用済み: {usedCredits}</div>
              <div className="text-xs">残り: {remainingCredits}</div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full", 
                  statusColor === "bg-green-500" ? "bg-green-500" : 
                  statusColor === "bg-yellow-500" ? "bg-yellow-500" : 
                  "bg-red-500"
                )} 
                style={{ width: `${percentageUsed}%` }}
              ></div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}