import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Running database schema push...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a PostgreSQL pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create a drizzle instance
  const db = drizzle(pool, { schema });

  try {
    // Create the database schema
    console.log('Pushing schema to database...');
    
    // Create extension for UUID generation if it doesn't exist
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Create sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire")`);
    
    // Create roles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create permissions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create role_permissions join table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )
    `);
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        organization VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        role_id INTEGER REFERENCES roles(id),
        last_login TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create presentations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS presentations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER REFERENCES users(id),
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        thumbnail TEXT
      )
    `);
    
    // Create presentation_access table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS presentation_access (
        id SERIAL PRIMARY KEY,
        presentation_id INTEGER NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_level VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        expires_at TIMESTAMP
      )
    `);
    
    // Create branches table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        presentation_id INTEGER NOT NULL REFERENCES presentations(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_default BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Create commits table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        branch_id INTEGER NOT NULL REFERENCES branches(id),
        user_id INTEGER REFERENCES users(id),
        parent_id INTEGER REFERENCES commits(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create slides table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS slides (
        id SERIAL PRIMARY KEY,
        commit_id INTEGER NOT NULL REFERENCES commits(id),
        slide_number INTEGER NOT NULL,
        title TEXT,
        content JSONB NOT NULL,
        thumbnail TEXT,
        xml_content TEXT NOT NULL
      )
    `);
    
    // Create diffs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS diffs (
        id SERIAL PRIMARY KEY,
        commit_id INTEGER NOT NULL REFERENCES commits(id),
        slide_id INTEGER NOT NULL REFERENCES slides(id),
        diff_content JSONB NOT NULL,
        xml_diff TEXT,
        change_type VARCHAR(20) NOT NULL
      )
    `);
    
    // Create snapshots table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        presentation_id INTEGER NOT NULL REFERENCES presentations(id),
        commit_id INTEGER NOT NULL REFERENCES commits(id),
        slide_id INTEGER REFERENCES slides(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        access_count INTEGER NOT NULL DEFAULT 0,
        data JSONB
      )
    `);
    
    // Create comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        slide_id INTEGER NOT NULL REFERENCES slides(id),
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved BOOLEAN DEFAULT FALSE,
        parent_id INTEGER REFERENCES comments(id)
      )
    `);
    
    console.log('Schema has been successfully pushed to the database!');
  } catch (error) {
    console.error('Error pushing schema to database:', error);
    throw error;
  } finally {
    // Close the PostgreSQL pool
    await pool.end();
  }
}

// Run the migration
main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});