import { Link, useLocation } from "wouter";
import { usePresentations } from "@/hooks/use-pptx";
import { useBranches } from "@/hooks/use-branches";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  FaFilePowerpoint,
  FaPlus,
  FaUserCircle,
  FaHistory,
  FaComments,
  FaTools,
  FaUserGraduate,
  FaMedal,
  FaChartLine,
  FaCreditCard
} from "react-icons/fa";

interface SidebarProps {
  onToggleVersionPanel?: () => void;
}

export default function Sidebar({ onToggleVersionPanel }: SidebarProps) {
  const [location] = useLocation();
  const { data: presentations, isLoading: isLoadingPresentations } = usePresentations();
  const { data: branches, isLoading: isLoadingBranches } = useBranches(presentations?.[0]?.id);
  const { user } = useAuth();
  
  // 学生レビュー枠の情報取得（通常はAPIエンドポイントから取得）
  const { data: studentReviewCredits } = useQuery({
    queryKey: ['/api/student-review-credits'],
    queryFn: async () => {
      // 実際のAPIが実装される予定です
      // モックデータの例
      return {
        totalCredits: 50,
        usedCredits: 28,
        remainingCredits: 22,
        planName: 'エンタープライズ'
      };
    },
    enabled: !!user
  });
  
  // ランキング情報の取得（通常はAPIエンドポイントから取得）
  const { data: studentRankings } = useQuery({
    queryKey: ['/api/student-rankings'],
    queryFn: async () => {
      // 実際のAPIが実装される予定です
      // モックデータの例
      return {
        goldStudents: 3,
        silverStudents: 8,
        bronzeStudents: 15,
        totalBonusPaid: 12500
      };
    },
    enabled: !!user
  });
  
  // Find active presentation from URL
  const activePresentationId = parseInt(location.split('/')[2]) || presentations?.[0]?.id;
  
  return (
    <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">PeerDiffX</h2>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3">ブランチ</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="新しいブランチを作成"
            >
              <FaPlus size={12} />
            </Button>
          </div>
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
        
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">ツール</h3>
          <div className="space-y-1">
            <button 
              onClick={onToggleVersionPanel}
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                <FaHistory className="text-xs" />
              </div>
              <span>バージョン履歴</span>
            </button>
            <button className="flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                <FaComments className="text-xs" />
              </div>
              <span>コメント</span>
            </button>
            <Link
              href="/settings"
              className="flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0 flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
                <FaTools className="text-xs" />
              </div>
              <span>設定</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
