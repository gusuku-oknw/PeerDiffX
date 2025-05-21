import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// WebSocket実装を設定
neonConfig.webSocketConstructor = ws;

// 環境変数の確認
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URLが設定されていません。データベースが正しく接続されているか確認してください。",
  );
}

// データベース接続プールの作成
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Drizzle ORMインスタンスの作成
export const db = drizzle(pool, { schema });