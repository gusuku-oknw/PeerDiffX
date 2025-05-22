// プレゼンテーション機能のAPI層
import { apiClient } from "@/shared/api";
import type { Presentation, InsertPresentation } from "@shared/schema";

export const presentationService = {
  // 全プレゼンテーション取得
  getAll: async (): Promise<Presentation[]> => {
    return apiClient.get('/presentations');
  },

  // ユーザーのプレゼンテーション取得
  getByUserId: async (userId: number): Promise<Presentation[]> => {
    return apiClient.get(`/users/${userId}/presentations`);
  },

  // ID指定でプレゼンテーション取得
  getById: async (id: number): Promise<Presentation> => {
    return apiClient.get(`/presentations/${id}`);
  },

  // 新規プレゼンテーション作成
  create: async (data: InsertPresentation): Promise<Presentation> => {
    return apiClient.post('/presentations', data);
  },

  // プレゼンテーション更新
  update: async (id: number, updates: Partial<InsertPresentation>): Promise<Presentation> => {
    return apiClient.patch(`/presentations/${id}`, updates);
  },

  // プレゼンテーション削除
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/presentations/${id}`);
  },

  // PPTXファイルのアップロード
  uploadPptx: async (file: File): Promise<Presentation> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/presentations/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload PPTX file');
    }
    
    return response.json();
  },

  // プレゼンテーションのロック状態管理
  lock: async (id: number): Promise<void> => {
    return apiClient.post(`/presentations/${id}/lock`);
  },

  unlock: async (id: number): Promise<void> => {
    return apiClient.post(`/presentations/${id}/unlock`);
  },

  getLockStatus: async (id: number): Promise<{ isLocked: boolean; lockedBy?: string }> => {
    return apiClient.get(`/presentations/${id}/lock-status`);
  },
};