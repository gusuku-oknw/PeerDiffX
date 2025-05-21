import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Check environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure the database is correctly connected.",
  );
}

console.log("Connecting to Supabase PostgreSQL database...");

// Create database connection pool for Supabase PostgreSQL
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log successful connection
pool.on('connect', () => {
  console.log("Successfully connected to Supabase PostgreSQL database");
});

// Log connection errors
pool.on('error', (err) => {
  console.error("Database connection error:", err);
});

// Create a simple query execution wrapper
export const db = {
  async execute(query: string, params?: any[]) {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  },
  
  async select() {
    return {
      from: (table: any) => {
        return {
          where: async (condition: any) => {
            try {
              const query = `SELECT * FROM ${table.name} WHERE ${condition}`;
              const result = await pool.query(query);
              return result.rows;
            } catch (error) {
              console.error("Select query error:", error);
              throw error;
            }
          },
          async execute() {
            try {
              const query = `SELECT * FROM ${table.name}`;
              const result = await pool.query(query);
              return result.rows;
            } catch (error) {
              console.error("Select query error:", error);
              throw error;
            }
          }
        };
      }
    };
  },
  
  async insert(table: any) {
    return {
      values: async (data: any) => {
        try {
          const columns = Object.keys(data).join(', ');
          const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(data);
          
          const query = `INSERT INTO ${table.name} (${columns}) VALUES (${placeholders}) RETURNING *`;
          const result = await pool.query(query, values);
          return result.rows;
        } catch (error) {
          console.error("Insert query error:", error);
          throw error;
        }
      }
    };
  },
  
  async update(table: any) {
    return {
      set: (data: any) => {
        return {
          where: async (condition: any) => {
            try {
              const setClause = Object.entries(data).map(([key, _], i) => `${key} = $${i + 1}`).join(', ');
              const values = Object.values(data);
              
              const query = `UPDATE ${table.name} SET ${setClause} WHERE ${condition} RETURNING *`;
              const result = await pool.query(query, values);
              return result.rows;
            } catch (error) {
              console.error("Update query error:", error);
              throw error;
            }
          }
        };
      }
    };
  },
  
  async delete(table: any) {
    return {
      where: async (condition: any) => {
        try {
          const query = `DELETE FROM ${table.name} WHERE ${condition}`;
          await pool.query(query);
        } catch (error) {
          console.error("Delete query error:", error);
          throw error;
        }
      }
    };
  }
};