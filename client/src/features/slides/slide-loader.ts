// スライドのロード処理を担当するユーティリティ
import { Slide } from "@shared/schema";

/**
 * 指定したコミットIDからスライドを取得する関数
 * キャッシュを回避するオプション付き
 */
export async function fetchSlides(commitId: number, avoidCache = true): Promise<Slide[]> {
  if (!commitId) return [];
  
  try {
    // キャッシュを回避するためのタイムスタンプ
    const timestamp = avoidCache ? new Date().getTime() : '';
    const url = `/api/commits/${commitId}/slides${avoidCache ? `?nocache=${timestamp}` : ''}`;
    
    const response = await fetch(url, {
      headers: avoidCache ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {}
    });
    
    if (!response.ok) {
      throw new Error(`スライド取得エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("スライド取得エラー:", error);
    return [];
  }
}

/**
 * デフォルトスライドを作成する関数
 */
export async function createDefaultSlide(commitId: number): Promise<Slide | null> {
  if (!commitId) return null;
  
  try {
    const defaultContent = {
      elements: [
        {
          id: "title1",
          type: "text",
          x: 100,
          y: 100,
          width: 600,
          height: 100,
          content: "テスト",
          style: { 
            fontSize: 32, 
            fontWeight: "bold", 
            color: "#333333" 
          }
        },
        {
          id: "subtitle1",
          type: "text",
          x: 100,
          y: 220,
          width: 600,
          height: 50,
          content: "Created with PeerDiffX",
          style: { 
            fontSize: 24, 
            color: "#666666" 
          }
        }
      ],
      background: "#ffffff"
    };

    const response = await fetch("/api/slides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        commitId: commitId,
        slideNumber: 1,
        title: "Welcome",
        content: defaultContent,
        xmlContent: "<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>テスト</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:txBody><a:p><a:r><a:t>Created with PeerDiffX</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>"
      })
    });
    
    if (!response.ok) {
      throw new Error(`スライド作成エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("スライド作成エラー:", error);
    return null;
  }
}

/**
 * スライド自動作成APIを使用する関数
 */
export async function createSlidesFromAPI(commitId: number, count = 1, title = "Welcome"): Promise<Slide[] | null> {
  if (!commitId) return null;
  
  try {
    const response = await fetch(`/api/commits/${commitId}/create-slides`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slideCount: count,
        title: title
      })
    });
    
    if (!response.ok) {
      return null; // エラーの場合はnullを返して他のメソッドを試せるようにする
    }
    
    return await response.json();
  } catch (error) {
    console.error("スライド自動作成エラー:", error);
    return null;
  }
}