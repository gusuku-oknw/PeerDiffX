/**
 * スナップショット機能のためのサービス
 * 共有可能なプレゼンテーションスナップショットを作成・管理する
 */

import { Snapshot } from "@shared/schema";

/**
 * 新しいスナップショットを作成する
 * @param presentationId プレゼンテーションID
 * @param slideId 現在のスライドID
 * @param customTitle カスタムタイトル（オプション）
 * @param expiresIn 有効期限（日数）
 */
export async function createSnapshot(
  presentationId: number,
  slideId: number,
  customTitle?: string,
  expiresIn: number = 30 // デフォルトは30日
): Promise<Snapshot | null> {
  try {
    const response = await fetch("/api/snapshots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        presentationId,
        slideId,
        customTitle,
        expiresInDays: expiresIn
      })
    });
    
    if (!response.ok) {
      throw new Error(`スナップショット作成エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("スナップショット作成に失敗:", error);
    return null;
  }
}

/**
 * スナップショットの共有URLを生成
 * @param snapshotId スナップショットID
 */
export function getShareableUrl(snapshotId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/snapshot/${snapshotId}`;
}

/**
 * スナップショットをクリップボードにコピー
 * @param url コピーするURL
 */
export async function copyToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("クリップボードへのコピーに失敗:", error);
    return false;
  }
}

/**
 * スナップショットを取得
 * @param id スナップショットID
 */
export async function getSnapshot(id: string): Promise<Snapshot | null> {
  try {
    const response = await fetch(`/api/snapshots/${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("スナップショット取得エラー:", error);
    return null;
  }
}