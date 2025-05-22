// API層の一元化
import { apiRequest } from "@/lib/queryClient";
import type { ApiResponse, PaginatedResponse } from "../types";

// 基本的なAPIクライアント
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return apiRequest(endpoint, 'POST', data) as Promise<T>;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return apiRequest(endpoint, 'PATCH', data) as Promise<T>;
  }

  async delete<T>(endpoint: string): Promise<T> {
    return apiRequest(endpoint, 'DELETE') as Promise<T>;
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();

// プレゼンテーション関連のAPI
export const presentationApi = {
  getAll: () => apiClient.get('/presentations'),
  getById: (id: number) => apiClient.get(`/presentations/${id}`),
  create: (data: any) => apiClient.post('/presentations', data),
  update: (id: number, data: any) => apiClient.patch(`/presentations/${id}`, data),
  delete: (id: number) => apiClient.delete(`/presentations/${id}`),
};

// スライド関連のAPI
export const slideApi = {
  getByCommitId: (commitId: number) => apiClient.get(`/commits/${commitId}/slides`),
  getById: (id: number) => apiClient.get(`/slides/${id}`),
  create: (data: any) => apiClient.post('/slides', data),
  update: (id: number, data: any) => apiClient.patch(`/slides/${id}`, data),
  delete: (id: number) => apiClient.delete(`/slides/${id}`),
};

// コメント関連のAPI
export const commentApi = {
  getBySlideId: (slideId: number) => apiClient.get(`/slides/${slideId}/comments`),
  create: (data: any) => apiClient.post('/comments', data),
  update: (id: number, data: any) => apiClient.patch(`/comments/${id}`, data),
  delete: (id: number) => apiClient.delete(`/comments/${id}`),
  getReplies: (commentId: number) => apiClient.get(`/comments/${commentId}/replies`),
};

// ブランチ関連のAPI
export const branchApi = {
  getByPresentationId: (presentationId: number) => apiClient.get(`/presentations/${presentationId}/branches`),
  getById: (id: number) => apiClient.get(`/branches/${id}`),
  create: (data: any) => apiClient.post('/branches', data),
  merge: (data: any) => apiClient.post('/branches/merge', data),
};

// コミット関連のAPI
export const commitApi = {
  getByBranchId: (branchId: number) => apiClient.get(`/branches/${branchId}/commits`),
  getById: (id: number) => apiClient.get(`/commits/${id}`),
  create: (data: any) => apiClient.post('/commits', data),
};

// 差分関連のAPI
export const diffApi = {
  getByCommitId: (commitId: number) => apiClient.get(`/commits/${commitId}/diffs`),
  create: (data: any) => apiClient.post('/diffs', data),
  compare: (baseCommitId: number, compareCommitId: number) => 
    apiClient.get(`/compare/${baseCommitId}/${compareCommitId}`),
};