import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaTimes, FaCode, FaColumns } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import XMLDiffViewer from "./xml-diff-viewer";

interface DiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  slideNumber: number;
  beforeCommitId: number;
  afterCommitId: number;
  beforeCommitTime: string;
  afterCommitTime: string;
}

export default function DiffViewer({
  isOpen,
  onClose,
  slideNumber,
  beforeCommitId,
  afterCommitId,
  beforeCommitTime,
  afterCommitTime
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'xml'>('visual');
  
  const renderVisualDiff = () => {
    return (
      <div className="flex flex-1 overflow-auto">
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm font-medium mb-2 text-gray-500">Before</div>
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Project Overview</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>XML-level diff extraction from PPTX files</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Git-like branch and merge management</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Browser-based instant preview</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="w-1/2 p-4">
          <div className="text-sm font-medium mb-2 text-gray-500">After</div>
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Project Overview</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>XML-level diff extraction from PPTX files</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Git-like branch and merge management</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                <span>Browser-based instant preview</span>
              </li>
              <li className="flex items-start bg-green-50 dark:bg-green-900/30 -mx-2 px-2 py-1 rounded">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-2 mr-3"></span>
                <span className="text-red-600 dark:text-red-400">API integration for advanced features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center">
          <DialogTitle>Diff View - Slide {slideNumber}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <FaTimes />
          </Button>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="text-sm font-medium">Comparing:</div>
              <div className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                Current ({afterCommitTime})
              </div>
              <div className="mx-2 text-gray-500">with</div>
              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm">
                {beforeCommitTime}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={viewMode === 'xml' ? 'secondary' : 'outline'}
              className={viewMode === 'xml' 
                ? "flex items-center px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded"
                : "flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              }
              onClick={() => setViewMode('xml')}
            >
              <FaCode className="mr-2" />
              <span>XML</span>
            </Button>
            <Button
              variant={viewMode === 'visual' ? 'secondary' : 'outline'}
              className={viewMode === 'visual' 
                ? "flex items-center px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded"
                : "flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              }
              onClick={() => setViewMode('visual')}
            >
              <FaColumns className="mr-2" />
              <span>Visual</span>
            </Button>
          </div>
        </div>
        
        {/* Diff Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'visual' ? renderVisualDiff() : <XMLDiffViewer />}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            Restore This Version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
