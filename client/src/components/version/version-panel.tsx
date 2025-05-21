import { useState } from "react";
import { useVersionHistory } from "@/hooks/use-version-history";
import { Commit } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { FaCheck, FaCodeBranch, FaPlus } from "react-icons/fa";

interface VersionPanelProps {
  slideId: number;
  onViewChanges: (commitId: number) => void;
  onRestoreVersion: (commitId: number) => void;
  onClose?: () => void;
}

export default function VersionPanel({ 
  slideId, 
  onViewChanges, 
  onRestoreVersion,
  onClose 
}: VersionPanelProps) {
  const { data: versionHistory, isLoading } = useVersionHistory(slideId);
  
  if (isLoading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold">Version History</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showing changes for current slide</p>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Function to render commit icon based on message
  const getCommitIcon = (commit: Commit) => {
    if (commit.message.toLowerCase().includes('merged')) {
      return <FaCodeBranch />;
    } else if (commit.message.toLowerCase().includes('initial')) {
      return <FaPlus />;
    } else {
      return <FaCheck />;
    }
  };
  
  // Function to get commit icon background color
  const getCommitIconBg = (commit: Commit) => {
    if (commit.message.toLowerCase().includes('merged')) {
      return 'bg-green-500';
    } else if (commit.message.toLowerCase().includes('initial')) {
      return 'bg-gray-400';
    } else {
      return 'bg-blue-500';
    }
  };
  
  // Calculate relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold">Version History</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showing changes for current slide</p>
        </div>
        <button 
          onClick={() => onClose && onClose()}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close version panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-4">
        <div className="space-y-4">
          {versionHistory?.map((commit, index) => (
            <div key={commit.id} className="branch-line">
              <div className="flex items-start">
                <div className={`commit-dot w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${getCommitIconBg(commit)} flex-shrink-0 flex items-center justify-center text-white text-xs`}>
                  {getCommitIcon(commit)}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">{commit.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {getRelativeTime(commit.createdAt)} by {commit.userId === 1 ? 'John Doe' : 'Anna Kim'}
                  </div>
                  
                  {index === 0 && (
                    <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                      Updated bullet points and added API integration task
                    </div>
                  )}
                  
                  {index === 1 && (
                    <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                      Applied new slide template and color scheme
                    </div>
                  )}
                  
                  <div className="mt-2 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      onClick={() => onViewChanges(commit.id)}
                    >
                      View changes
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => onRestoreVersion(commit.id)}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Button 
          variant="outline" 
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm font-medium"
        >
          Compare Versions
        </Button>
      </div>
    </div>
  );
}
