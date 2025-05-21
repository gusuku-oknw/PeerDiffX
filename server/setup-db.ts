import { db } from './db';
import * as schema from '@shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool } from '@neondatabase/serverless';

/**
 * This script will create all tables in the database based on our schema
 */
async function setupDatabase() {
  console.log('Setting up database...');
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create tables directly without prompting
    // First roles
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    // Then permissions
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    // Then users
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        organization VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    // Then role_permissions
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `);
    
    // Then presentations
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS presentations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_id INTEGER REFERENCES users(id),
        is_public BOOLEAN DEFAULT FALSE NOT NULL,
        status VARCHAR(20) DEFAULT 'draft' NOT NULL,
        thumbnail TEXT
      );
    `);
    
    // Then presentation_access
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS presentation_access (
        id SERIAL PRIMARY KEY,
        presentation_id INTEGER NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_level VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_by INTEGER REFERENCES users(id),
        expires_at TIMESTAMP
      );
    `);
    
    // Then branches
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        presentation_id INTEGER REFERENCES presentations(id) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        is_default BOOLEAN DEFAULT FALSE
      );
    `);
    
    // Then commits
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        branch_id INTEGER REFERENCES branches(id) NOT NULL,
        user_id INTEGER REFERENCES users(id),
        parent_id INTEGER REFERENCES commits(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    // Then slides
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS slides (
        id SERIAL PRIMARY KEY,
        commit_id INTEGER REFERENCES commits(id) NOT NULL,
        slide_number INTEGER NOT NULL,
        title TEXT,
        content JSONB NOT NULL,
        thumbnail TEXT,
        xml_content TEXT NOT NULL
      );
    `);
    
    // Then diffs
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS diffs (
        id SERIAL PRIMARY KEY,
        commit_id INTEGER REFERENCES commits(id) NOT NULL,
        slide_id INTEGER REFERENCES slides(id) NOT NULL,
        diff_content JSONB NOT NULL,
        xml_diff TEXT,
        change_type VARCHAR(20) NOT NULL
      );
    `);
    
    // Then snapshots
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        presentation_id INTEGER NOT NULL REFERENCES presentations(id),
        commit_id INTEGER NOT NULL REFERENCES commits(id),
        slide_id INTEGER REFERENCES slides(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        access_count INTEGER DEFAULT 0 NOT NULL,
        data JSONB
      );
    `);
    
    // Then comments
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        slide_id INTEGER NOT NULL REFERENCES slides(id),
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        parent_id INTEGER REFERENCES comments(id)
      );
    `);
    
    // Add table for sessions (needed for auth)
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" VARCHAR NOT NULL PRIMARY KEY,
        "sess" JSONB NOT NULL,
        "expire" TIMESTAMP NOT NULL
      );
    `);
    
    await db.execute(/* sql */`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
    `);
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('Database setup successfully completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });