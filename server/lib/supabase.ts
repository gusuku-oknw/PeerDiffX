import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

// Supabaseクライアントの作成
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ユーザー認証関連のヘルパー関数
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116は結果が見つからない場合のエラー
  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// プレゼンテーション関連のヘルパー関数
export async function getPresentations(userId: string) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('userId', userId);
  
  if (error) throw error;
  return data;
}

export async function getPresentation(id: number) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createPresentation(presentation: any) {
  const { data, error } = await supabase
    .from('presentations')
    .insert(presentation)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// シンプルなキャッシュ実装（オプション）
const cache = new Map<string, { data: any, expiry: number }>();

export function cacheGet<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlSeconds = 300): void {
  const expiry = Date.now() + (ttlSeconds * 1000);
  cache.set(key, { data, expiry });
}

export function clearCache(): void {
  cache.clear();
}