import { db } from './db';

/**
 * This script updates the tables to match our schema definition
 */
async function updateTables() {
  console.log('Updating database tables...');
  
  try {
    // Check existing tables
    const tables = await db.execute(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Existing tables:', tables.rows.map(row => row.table_name).join(', '));
    
    console.log('Updating presentations table...');
    // Add missing columns to presentations table
    await db.execute(`
      ALTER TABLE IF EXISTS presentations 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' NOT NULL,
      ADD COLUMN IF NOT EXISTS thumbnail TEXT;
    `);
    
    // Add missing columns to branches table
    console.log('Updating branches table...');
    await db.execute(`
      ALTER TABLE IF EXISTS branches 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
    `);
    
    // Add missing columns to slides table
    console.log('Updating slides table...');
    await db.execute(`
      ALTER TABLE IF EXISTS slides 
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS thumbnail TEXT;
    `);

    // Add missing columns to diffs table
    console.log('Updating diffs table...');
    await db.execute(`
      ALTER TABLE IF EXISTS diffs 
      ADD COLUMN IF NOT EXISTS xml_diff TEXT;
    `);
    
    console.log('Tables updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating tables:', error);
    throw error;
  }
}

// Run the update
updateTables()
  .then(() => {
    console.log('Database schema update completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database schema update failed:', error);
    process.exit(1);
  });