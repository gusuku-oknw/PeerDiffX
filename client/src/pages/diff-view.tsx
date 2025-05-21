import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaCode, FaColumns, FaArrowLeft } from "react-icons/fa";
import { useCommit, useSlides } from "@/hooks/use-pptx";
import XMLDiffViewer from "@/components/diff/xml-diff-viewer";

export default function DiffView() {
  const [, params] = useRoute("/diff/:baseCommitId/:compareCommitId");
  const baseCommitId = parseInt(params?.baseCommitId || "0");
  const compareCommitId = parseInt(params?.compareCommitId || "0");
  
  const [viewMode, setViewMode] = useState<'visual' | 'xml'>('visual');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  const { data: baseCommit, isLoading: isLoadingBaseCommit } = useCommit(baseCommitId);
  const { data: compareCommit, isLoading: isLoadingCompareCommit } = useCommit(compareCommitId);
  
  const { data: baseSlides, isLoading: isLoadingBaseSlides } = useSlides(baseCommitId);
  const { data: compareSlides, isLoading: isLoadingCompareSlides } = useSlides(compareCommitId);
  
  useEffect(() => {
    // Set the first slide as active by default
    if (baseSlides && baseSlides.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [baseSlides]);
  
  const isLoading = isLoadingBaseCommit || isLoadingCompareCommit || isLoadingBaseSlides || isLoadingCompareSlides;
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getActiveSlides = () => {
    if (!baseSlides || !compareSlides || baseSlides.length === 0 || compareSlides.length === 0) {
      return { baseSlide: null, compareSlide: null };
    }
    
    const baseSlide = baseSlides[activeSlideIndex];
    
    // Find matching slide in compareSlides by slideNumber
    const compareSlide = compareSlides.find(slide => slide.slideNumber === baseSlide.slideNumber) || compareSlides[0];
    
    return { baseSlide, compareSlide };
  };
  
  const { baseSlide, compareSlide } = getActiveSlides();
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!baseCommit || !compareCommit || !baseSlides || !compareSlides) {
    return (
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Commits Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The specified commits could not be found or do not contain any slides.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Link href={`/history/${baseCommit.branchId}`}>
          <Button variant="outline" className="mb-4">
            <FaArrowLeft className="mr-2" />
            Back to History
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-2">Comparing Changes</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Base:</span>{" "}
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {baseCommit.message} ({formatDate(baseCommit.createdAt)})
            </span>
          </div>
          <div className="hidden md:block">→</div>
          <div>
            <span className="font-medium">Compare:</span>{" "}
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
              {compareCommit.message} ({formatDate(compareCommit.createdAt)})
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium mr-2">Slide:</label>
              <select 
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                value={activeSlideIndex}
                onChange={(e) => setActiveSlideIndex(parseInt(e.target.value))}
              >
                {baseSlides.map((slide, index) => (
                  <option key={slide.id} value={index}>
                    Slide {slide.slideNumber}: {slide.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={viewMode === 'xml' ? 'secondary' : 'outline'}
              onClick={() => setViewMode('xml')}
              className="flex items-center"
              size="sm"
            >
              <FaCode className="mr-2" />
              <span>XML</span>
            </Button>
            <Button
              variant={viewMode === 'visual' ? 'secondary' : 'outline'}
              onClick={() => setViewMode('visual')}
              className="flex items-center"
              size="sm"
            >
              <FaColumns className="mr-2" />
              <span>Visual</span>
            </Button>
          </div>
        </div>
        
        {viewMode === 'visual' ? (
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm font-medium mb-2 text-gray-500">Before</div>
              {baseSlide && (
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-4">
                  <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{baseSlide.title}</h2>
                  {baseSlide.slideNumber === 2 && (
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
                        <span>Browser-based preview</span>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 p-4">
              <div className="text-sm font-medium mb-2 text-gray-500">After</div>
              {compareSlide && (
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-4">
                  <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{compareSlide.title}</h2>
                  {compareSlide.slideNumber === 2 && (
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
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <XMLDiffViewer />
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          Cancel
        </Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Restore This Version
        </Button>
      </div>
    </div>
  );
}
