// 共通型定義の集約
// Note: スキーマは別途インポートする必要があります

// アプリケーション固有の型定義
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: "success" | "error";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// UI関連の型
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  content: React.ReactNode;
}

// ボトムパネル関連の型
export type BottomPanelTab = 'comments' | 'history' | 'locks' | 'ai';

export interface PanelState {
  isOpen: boolean;
  activeTab: BottomPanelTab;
  height: number;
}

// スライド表示関連の型
export interface SlideViewState {
  currentSlideId: number | null;
  currentSlideIndex: number;
  zoomLevel: number;
  aspectRatio: '16:9' | '4:3';
  isFullscreen: boolean;
}

// 共通のエラー型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}