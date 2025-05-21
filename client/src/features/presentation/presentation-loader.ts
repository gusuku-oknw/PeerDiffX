// プレゼンテーションのロードと管理に関する機能
import { Presentation } from "@shared/schema";
import { fetchBranches, findDefaultBranch } from "@/features/branches/branch-manager";
import { fetchSlides, createSlidesFromAPI, createDefaultSlide } from "@/features/slides/slide-loader";

/**
 * プレゼンテーションの読み込みと初期化を行うクラス
 */
export class PresentationLoader {
  private presentationId: number;
  
  constructor(presentationId: number) {
    this.presentationId = presentationId;
  }
  
  /**
   * プレゼンテーションデータを取得
   */
  async loadPresentation(): Promise<Presentation | null> {
    if (!this.presentationId) return null;
    
    try {
      const response = await fetch(`/api/presentations/${this.presentationId}`);
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("プレゼンテーション取得エラー:", error);
      return null;
    }
  }
  
  /**
   * デフォルトブランチと最新コミットを確認し、必要に応じてスライドを作成
   */
  async initializeWithSlides(): Promise<{
    presentation: Presentation | null,
    defaultBranch: any | null,
    latestCommit: any | null,
    slides: any[] | null,
    activeSlideId: number | null
  }> {
    const presentation = await this.loadPresentation();
    if (!presentation) {
      return { presentation: null, defaultBranch: null, latestCommit: null, slides: null, activeSlideId: null };
    }
    
    // デフォルトブランチを取得（存在しない場合は作成）
    let defaultBranch = await findDefaultBranch(this.presentationId);
    
    if (!defaultBranch) {
      // ブランチ作成
      defaultBranch = await this.createInitialBranchAndCommit();
      if (!defaultBranch) {
        return { presentation, defaultBranch: null, latestCommit: null, slides: null, activeSlideId: null };
      }
    }
    
    // 最新コミットを取得
    const commits = await this.getCommits(defaultBranch.id);
    const latestCommit = commits && commits.length > 0 ? commits[0] : null;
    
    if (!latestCommit) {
      return { presentation, defaultBranch, latestCommit: null, slides: null, activeSlideId: null };
    }
    
    // スライドを取得
    let slides = await fetchSlides(latestCommit.id);
    let activeSlideId = null;
    
    // スライドがない場合は作成を試みる
    if (!slides || slides.length === 0) {
      // 自動スライド作成APIを試す
      const newSlides = await createSlidesFromAPI(latestCommit.id);
      
      if (newSlides && newSlides.length > 0) {
        slides = newSlides;
        activeSlideId = slides[0].id;
      } else {
        // 手動でスライドを作成
        const newSlide = await createDefaultSlide(latestCommit.id);
        
        if (newSlide) {
          slides = [newSlide];
          activeSlideId = newSlide.id;
        }
      }
    } else if (slides.length > 0) {
      activeSlideId = slides[0].id;
    }
    
    return { presentation, defaultBranch, latestCommit, slides, activeSlideId };
  }
  
  /**
   * コミットを取得
   */
  private async getCommits(branchId: number) {
    if (!branchId) return null;
    
    try {
      const response = await fetch(`/api/branches/${branchId}/commits`);
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("コミット取得エラー:", error);
      return null;
    }
  }
  
  /**
   * 初期ブランチとコミットを作成
   */
  private async createInitialBranchAndCommit() {
    // ここにブランチとコミットの作成ロジックを実装
    // 現在は基本的な構造だけ用意していますが、必要に応じて拡張してください
    return null;
  }
}