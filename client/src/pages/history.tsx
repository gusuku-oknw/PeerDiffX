import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBranch } from "@/hooks/use-branches";
import { useCommits } from "@/hooks/use-pptx";
import { Commit } from "@shared/schema";
import { FaCheck, FaCodeBranch, FaPlus, FaHistory, FaArrowLeft, FaChevronRight } from "react-icons/fa";

export default function History() {
  const [, params] = useRoute("/history/:branchId");
  const branchId = parseInt(params?.branchId || "0");
  
  const { data: branch, isLoading: isLoadingBranch } = useBranch(0, false, branchId);
  const { data: commits, isLoading: isLoadingCommits } = useCommits(branchId);
  
  // Determine the selected commit for highlighting
  const [selectedCommitId, setSelectedCommitId] = useState<number | null>(null);
  
  // Function to render commit icon based on message
  const getCommitIcon = (commit: Commit) => {
    if (commit.message.toLowerCase().includes('merged')) {
      return <FaCodeBranch className="text-white" />;
    } else if (commit.message.toLowerCase().includes('initial')) {
      return <FaPlus className="text-white" />;
    } else {
      return <FaCheck className="text-white" />;
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
  
  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate relative time
  const getRelativeTime = (date: Date | string) => {
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
  
  if (isLoadingBranch || isLoadingCommits) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!branch) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Branch Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The specified branch could not be found.
              </p>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Commit History</h1>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <span className="inline-block w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: branch.name === 'main' ? '#3b82f6' : branch.name.startsWith('feature/') ? '#22c55e' : '#a855f7' }}
          ></span>
          <span className="font-medium">{branch.name}</span>
          {branch.isDefault && <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Default</span>}
        </div>
      </div>
      
      {!commits || commits.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FaHistory className="mx-auto text-5xl text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Commits Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This branch doesn't have any commits. Make changes to the presentation to create the first commit.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {commits.map((commit, index) => {
            const isSelected = commit.id === selectedCommitId;
            const isFirst = index === 0;
            
            return (
              <div 
                key={commit.id} 
                className={`branch-line relative bg-white dark:bg-gray-800 rounded-lg border ${isSelected ? 'border-blue-500 dark:border-blue-400 shadow-md' : 'border-gray-200 dark:border-gray-700'} overflow-hidden`}
                onClick={() => setSelectedCommitId(isSelected ? null : commit.id)}
              >
                <div className="p-4 flex">
                  <div className={`commit-dot w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 ${getCommitIconBg(commit)} flex-shrink-0 flex items-center justify-center text-sm`}>
                    {getCommitIcon(commit)}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{commit.message}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(commit.createdAt)} ({getRelativeTime(commit.createdAt)})
                        </p>
                      </div>
                      
                      {isFirst && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                    
                    {index === 0 && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm">
                        Updated bullet points and added API integration task
                      </div>
                    )}
                    
                    {index === 1 && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm">
                        Applied new slide template and color scheme
                      </div>
                    )}
                    
                    <div className={`mt-4 flex flex-wrap gap-2 ${isSelected ? 'block' : 'hidden'}`}>
                      {index > 0 && (
                        <Link href={`/diff/${commit.id}/${commits[0].id}`}>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <span>Compare with latest</span>
                            <FaChevronRight className="ml-2" />
                          </Button>
                        </Link>
                      )}
                      
                      <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400">
                        Restore this version
                      </Button>
                      
                      <Link href={`/preview/${branch.presentationId}`}>
                        <Button variant="outline" size="sm">
                          View presentation at this point
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
