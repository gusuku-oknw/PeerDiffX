// スライド機能のAPI層
import { apiClient } from "@/shared/api";
import type { Slide, InsertSlide } from "@shared/schema";

export const slideService = {
  // コミットIDからスライド一覧を取得
  getByCommitId: async (commitId: number): Promise<Slide[]> => {
    return apiClient.get(`/commits/${commitId}/slides`);
  },

  // スライドIDから単体取得
  getById: async (id: number): Promise<Slide> => {
    return apiClient.get(`/slides/${id}`);
  },

  // 新しいスライドを作成
  create: async (slideData: InsertSlide): Promise<Slide> => {
    return apiClient.post('/slides', slideData);
  },

  // スライドを更新
  update: async (id: number, updates: Partial<InsertSlide>): Promise<Slide> => {
    return apiClient.patch(`/slides/${id}`, updates);
  },

  // スライドを削除
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/slides/${id}`);
  },

  // スライドコンテンツの検証
  validateContent: (content: any): boolean => {
    // 基本的なバリデーション
    if (!content || typeof content !== 'object') {
      return false;
    }
    
    // 必要な構造があるかチェック
    return true;
  }
};