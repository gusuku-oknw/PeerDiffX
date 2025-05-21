import { Link, useLocation } from "wouter";
import { usePresentations } from "@/hooks/use-pptx";
import { useBranch } from "@/hooks/use-branches";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import BranchSelector from "@/components/branches/branch-selector";
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
  const presentationId = parseInt(location.split('/')[2]) || presentations?.[0]?.id;
  
  // 新しいブランチ機能を使用
  const {
    branches,
    currentBranch,
    loading: isLoadingBranches,
    changeBranch,
    createBranch,
    mergeBranches
  } = useBranch(presentationId || null);
  
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
        
        {/* 学生レビュー枠インジケーター */}
        {user && studentReviewCredits && (
          <div className="mb-6 px-3 py-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-300">学生レビュー枠</h3>
              <span className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                {studentReviewCredits.planName}
              </span>
            </div>
            <div className="mb-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">残り {studentReviewCredits.remainingCredits} 枠</span>
                <span className="text-gray-500 dark:text-gray-400">{studentReviewCredits.usedCredits}/{studentReviewCredits.totalCredits}</span>
              </div>
              <Progress value={(studentReviewCredits.usedCredits / studentReviewCredits.totalCredits) * 100} className="h-2" />
            </div>
            <div className="mt-2">
              <Link href="/billing" className="text-xs text-blue-600 dark:text-blue-300 hover:underline flex items-center">
                <FaCreditCard size={10} className="mr-1" />
                追加枠を購入
              </Link>
            </div>
          </div>
        )}
        
        {/* 優秀者ランキング表示 */}
        {user && studentRankings && (
          <div className="mb-6 px-3 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">優秀者ランキング</h3>
              <Link href="/rankings" className="text-xs text-yellow-600 dark:text-yellow-300 hover:underline">
                詳細
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <div className="flex justify-center">
                  <FaMedal size={16} className="text-yellow-500" />
                </div>
                <div className="text-xs font-semibold mt-1">{studentRankings.goldStudents}</div>
                <div className="text-xs text-gray-500">ゴールド</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <FaMedal size={16} className="text-gray-400" />
                </div>
                <div className="text-xs font-semibold mt-1">{studentRankings.silverStudents}</div>
                <div className="text-xs text-gray-500">シルバー</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <FaMedal size={16} className="text-amber-700" />
                </div>
                <div className="text-xs font-semibold mt-1">{studentRankings.bronzeStudents}</div>
                <div className="text-xs text-gray-500">ブロンズ</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 border-t border-yellow-200 dark:border-yellow-800 pt-2">
              ボーナス支給総額: ¥{studentRankings.totalBonusPaid.toLocaleString()}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3">ブランチ</h3>
          </div>
          
          {/* ブランチセレクター */}
          {presentationId && (
            <div className="px-3 mb-3">
              <BranchSelector
                presentationId={presentationId}
                currentBranchId={currentBranch?.id || null}
                onBranchChange={changeBranch}
                onCreateBranch={createBranch}
                onMergeBranch={mergeBranches}
              />
            </div>
          )}
          
          <div className="space-y-1 mt-3">
            {isLoadingBranches ? (
              <div className="animate-pulse space-y-2 px-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : (
              <div className="px-3">
                <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-2">利用可能なブランチ</h4>
                {branches.map((branch) => (
                  <div 
                    key={branch.id} 
                    onClick={() => changeBranch(branch.id)}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      currentBranch?.id === branch.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                      branch.name === 'main' 
                        ? 'bg-blue-500' 
                        : branch.name.startsWith('feature') 
                          ? 'bg-green-500' 
                          : 'bg-purple-500'
                    }`}></div>
                    <span className={currentBranch?.id === branch.id ? 'font-medium text-sm' : 'text-sm'}>
                      {branch.name}
                    </span>
                    {branch.isDefault && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        デフォルト
                      </span>
                    )}
                  </div>
                ))}
              </div>
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
            <Link href="/ai-analysis" className="flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                <FaChartLine className="text-xs" />
              </div>
              <span>AI分析レポート</span>
            </Link>
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
