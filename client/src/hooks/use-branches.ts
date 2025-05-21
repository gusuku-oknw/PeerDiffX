import { useState, useEffect, useCallback } from "react";
import { Branch, Commit } from "@shared/schema";
import { 
  fetchBranches, 
  fetchBranch,
  createBranch as createBranchApi,
  mergeBranches as mergeBranchesApi
} from "@/features/branches/branch-manager";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

/**
 * 古いブランチ管理機能（後方互換性のため）
 */
export function useBranches(presentationId: number) {
  return useQuery({
    queryKey: [`/api/presentations/${presentationId}/branches`],
    queryFn: async () => {
      if (!presentationId) return [];
      return await fetchBranches(presentationId);
    },
    enabled: !!presentationId
  });
}

/**
 * プレゼンテーションのブランチ管理機能を提供するカスタムフック
 */
export function useBranch(presentationId: number | null) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ブランチリスト読み込み
  const loadBranches = useCallback(async () => {
    if (!presentationId) return;
    
    setLoading(true);
    try {
      const branchList = await fetchBranches(presentationId);
      setBranches(branchList);
      
      // 初期表示時にデフォルトブランチを選択
      if (!currentBranch && branchList.length > 0) {
        const defaultBranch = branchList.find(b => b.isDefault) || branchList[0];
        setCurrentBranch(defaultBranch);
      }
    } catch (error) {
      console.error("ブランチ読み込みエラー:", error);
      toast({
        title: "ブランチ読み込みエラー",
        description: "ブランチ情報の取得に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [presentationId, currentBranch, toast]);

  // 初期読み込み
  useEffect(() => {
    if (presentationId) {
      loadBranches();
    }
  }, [presentationId, loadBranches]);

  // ブランチ切り替え
  const changeBranch = useCallback(async (branchId: number) => {
    if (!branchId) return;
    
    setLoading(true);
    try {
      const branch = await fetchBranch(branchId);
      if (branch) {
        setCurrentBranch(branch);
        toast({
          title: "ブランチを切り替えました",
          description: `${branch.name} に切り替えました`,
        });
      }
    } catch (error) {
      console.error("ブランチ切り替えエラー:", error);
      toast({
        title: "ブランチ切り替えエラー",
        description: "ブランチの切り替えに失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 新しいブランチを作成
  const createBranch = useCallback(async (
    name: string, 
    description: string, 
    baseBranchId: number
  ) => {
    if (!presentationId || !name) return;
    
    setLoading(true);
    try {
      const result = await createBranchApi(
        presentationId,
        name,
        description,
        baseBranchId
      );
      
      if (result) {
        await loadBranches();
        toast({
          title: "ブランチを作成しました",
          description: `${name} ブランチが作成されました`,
        });
      }
    } catch (error) {
      console.error("ブランチ作成エラー:", error);
      toast({
        title: "ブランチ作成エラー",
        description: "新しいブランチの作成に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [presentationId, loadBranches, toast]);

  // ブランチをマージ
  const mergeBranches = useCallback(async (
    sourceBranchId: number,
    targetBranchId: number,
    commitMessage: string
  ): Promise<Commit | null> => {
    if (!sourceBranchId || !targetBranchId) return null;
    
    setLoading(true);
    try {
      const result = await mergeBranchesApi(
        sourceBranchId,
        targetBranchId,
        commitMessage
      );
      
      if (result) {
        toast({
          title: "ブランチをマージしました",
          description: commitMessage,
        });
        
        await loadBranches();
        return result;
      }
    } catch (error) {
      console.error("ブランチマージエラー:", error);
      toast({
        title: "ブランチマージエラー",
        description: "ブランチのマージに失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    
    return null;
  }, [loadBranches, toast]);

  return {
    branches,
    currentBranch,
    loading,
    loadBranches,
    changeBranch,
    createBranch,
    mergeBranches
  };
}