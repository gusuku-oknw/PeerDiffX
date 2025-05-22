// コメント機能のAPI層
import { apiClient } from "@/shared/api";
import type { Comment, InsertComment } from "@shared/schema";

export const commentService = {
  // スライドのコメント一覧を取得
  getBySlideId: async (slideId: number): Promise<Comment[]> => {
    return apiClient.get(`/slides/${slideId}/comments`);
  },

  // コメントを作成
  create: async (commentData: InsertComment): Promise<Comment> => {
    return apiClient.post('/comments', commentData);
  },

  // コメントを更新
  update: async (id: number, updates: Partial<InsertComment>): Promise<Comment> => {
    return apiClient.patch(`/comments/${id}`, updates);
  },

  // コメントを削除
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/comments/${id}`);
  },

  // コメントの返信を取得
  getReplies: async (commentId: number): Promise<Comment[]> => {
    return apiClient.get(`/comments/${commentId}/replies`);
  },

  // コメントを解決済みにする
  resolve: async (id: number): Promise<Comment> => {
    return apiClient.patch(`/comments/${id}`, { resolved: true });
  },

  // コメントの解決を取り消す
  unresolve: async (id: number): Promise<Comment> => {
    return apiClient.patch(`/comments/${id}`, { resolved: false });
  },
};