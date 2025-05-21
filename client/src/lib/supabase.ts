import { createClient } from '@supabase/supabase-js';

// 環境変数から認証情報を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL や Anonymous Key が設定されていません。');
}

// Supabaseクライアントを作成
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// ユーザー認証関連のヘルパー関数
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// プロフィール情報の取得と更新
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUserProfile(updates: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('ユーザーが認証されていません');
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}