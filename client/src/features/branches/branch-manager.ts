// ブランチ管理に関する機能を集約
import { Branch } from "@shared/schema";

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