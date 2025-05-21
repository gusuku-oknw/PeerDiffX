import { Link, useLocation } from "wouter";
import { usePresentations } from "@/hooks/use-pptx";
import { useBranches } from "@/hooks/use-branches";
import { Button } from "@/components/ui/button";
import {
  FaFilePowerpoint,
  FaPlus,
  FaUserCircle
} from "react-icons/fa";

export default function Sidebar() {
  const [location] = useLocation();
  const { data: presentations, isLoading: isLoadingPresentations } = usePresentations();
  const { data: branches, isLoading: isLoadingBranches } = useBranches(presentations?.[0]?.id);
  
  // Find active presentation from URL
  const activePresentationId = parseInt(location.split('/')[2]) || presentations?.[0]?.id;
  
  return (
    <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Project Files</h2>
          <Button variant="ghost" size="sm" className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <FaPlus />
          </Button>
        </div>
        
        <div className="space-y-1 mb-6">
          {isLoadingPresentations ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            presentations?.map((presentation) => (
              <Link 
                key={presentation.id} 
                href={`/preview/${presentation.id}`}
                className={`flex items-center px-3 py-2 rounded-md ${presentation.id === activePresentationId ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
              >
                <FaFilePowerpoint className="mr-3" />
                <span className={`truncate ${presentation.id === activePresentationId ? 'font-medium' : ''}`}>
                  {presentation.name}
                </span>
              </Link>
            ))
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">Branches</h3>
          <div className="space-y-1">
            {isLoadingBranches ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              branches?.map((branch) => (
                <Link 
                  key={branch.id} 
                  href={`/history/${branch.id}`}
                  className={`flex items-center px-3 py-2 rounded-md ${branch.isDefault ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
                >
                  <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${branch.name === 'main' ? 'bg-blue-500' : branch.name.startsWith('feature') ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                  <span className={branch.isDefault ? 'font-medium' : ''}>
                    {branch.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">Recent Activities</h3>
          <div className="space-y-3">
            <div className="px-3 py-2 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-semibold mr-2 mt-0.5">
                  JD
                </div>
                <div>
                  <p className="text-gray-800 dark:text-gray-200">You committed <span className="font-medium">Update slide 3</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="px-3 py-2 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-semibold mr-2 mt-0.5">
                  AK
                </div>
                <div>
                  <p className="text-gray-800 dark:text-gray-200">Anna merged <span className="font-medium">feature/charts</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
