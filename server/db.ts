import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/pg-pool';
import * as schema from "@shared/schema";

// Check environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure the database is correctly connected.",
  );
}

console.log("Connecting to PostgreSQL database...");

// Create database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

// Log successful connection
pool.on('connect', () => {
  console.log("Successfully connected to PostgreSQL database");
});

// Log connection errors
pool.on('error', (err) => {
  console.error("Database connection error:", err);
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });