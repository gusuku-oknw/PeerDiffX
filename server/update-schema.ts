import { db } from './db';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { pool } from './db';

async function main() {
  console.log('Starting database migration...');
  
  try {
    // Add profileImageUrl column to users table
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);

    // Make password nullable (for OAuth users)
    await db.execute(`
      ALTER TABLE users
      ALTER COLUMN password DROP NOT NULL;
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });