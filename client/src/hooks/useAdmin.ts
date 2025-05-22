import { useAuth } from "./useAuth";

// 管理者ユーザーIDのリスト
const ADMIN_USER_IDS = ['41964833'];

export function useAdmin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // 管理者ユーザーIDと照合（ユーザーID: 41964833）
  const isAdmin = isAuthenticated && user && 
    ((user as any).id === '41964833' || 
     (user as any).id === 41964833 || 
     (user as any).username === '41964833');
  
  return {
    isAdmin: !!isAdmin,
    isLoading,
    canAccessStudentDashboard: !!isAdmin,
    canAccessCorporateDashboard: !!isAdmin,
    user
  };
}