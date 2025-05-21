// ブランチ管理に関する機能を集約
import { Branch, Commit } from "@shared/schema";

/**
 * プレゼンテーションに関連するブランチを取得する関数
 * キャッシュを回避するオプション付き
 */
export async function fetchBranches(presentationId: number, avoidCache = true): Promise<Branch[]> {
  if (!presentationId) return [];
  
  try {
    // キャッシュを回避するためのタイムスタンプ
    const timestamp = avoidCache ? new Date().getTime() : '';
    const url = `/api/presentations/${presentationId}/branches${avoidCache ? `?nocache=${timestamp}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ブランチ取得エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("ブランチ取得エラー:", error);
    return [];
  }
}

/**
 * 特定のブランチを取得する関数
 */
export async function fetchBranch(branchId: number): Promise<Branch | null> {
  if (!branchId) return null;
  
  try {
    const response = await fetch(`/api/branches/${branchId}`);
    
    if (!response.ok) {
      throw new Error(`ブランチ取得エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("ブランチ取得エラー:", error);
    return null;
  }
}

/**
 * デフォルトブランチを作成する関数
 */
export async function createDefaultBranch(presentationId: number): Promise<Branch | null> {
  if (!presentationId) return null;
  
  try {
    const response = await fetch("/api/branches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "main",
        description: "Default branch",
        presentationId: presentationId,
        isDefault: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`ブランチ作成エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("ブランチ作成エラー:", error);
    return null;
  }
}

/**
 * 新しいブランチを作成する関数
 * @param presentationId プレゼンテーションID
 * @param name ブランチ名
 * @param description ブランチの説明
 * @param baseBranchId 派生元のブランチID
 */
export async function createBranch(
  presentationId: number, 
  name: string, 
  description: string = "", 
  baseBranchId: number | null = null
): Promise<Branch | null> {
  if (!presentationId || !name) return null;
  
  try {
    const response = await fetch("/api/branches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        description,
        presentationId,
        isDefault: false,
        baseBranchId // 派生元のブランチID（APIで処理）
      })
    });
    
    if (!response.ok) {
      throw new Error(`ブランチ作成エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("ブランチ作成エラー:", error);
    return null;
  }
}

/**
 * ブランチをマージする関数
 * @param sourceBranchId マージ元ブランチID
 * @param targetBranchId マージ先ブランチID
 * @param commitMessage マージコミットのメッセージ
 */
export async function mergeBranches(
  sourceBranchId: number,
  targetBranchId: number,
  commitMessage: string = "Merge branch"
): Promise<Commit | null> {
  if (!sourceBranchId || !targetBranchId) return null;
  
  try {
    const response = await fetch("/api/branches/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceBranchId,
        targetBranchId,
        commitMessage
      })
    });
    
    if (!response.ok) {
      throw new Error(`ブランチマージエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("ブランチマージエラー:", error);
    return null;
  }
}

/**
 * プレゼンテーションから既存のデフォルトブランチを検索する
 * 見つからない場合はnullを返す
 */
export async function findDefaultBranch(presentationId: number): Promise<Branch | null> {
  const branches = await fetchBranches(presentationId, true);
  
  if (!branches || branches.length === 0) {
    return null;
  }
  
  // isDefaultフラグがついているブランチを探す
  const defaultBranch = branches.find(branch => branch.isDefault);
  
  if (defaultBranch) {
    return defaultBranch;
  }
  
  // isDefaultが設定されていない場合、最初のブランチを返す
  return branches[0];
}