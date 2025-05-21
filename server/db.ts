import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Set WebSocket implementation
neonConfig.webSocketConstructor = ws;

// Check environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure the database is correctly connected.",
  );
}

// Create database connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });