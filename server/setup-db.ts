import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from './db';

/**
 * This script will create all tables in the database based on our schema
 */
async function setupDatabase() {
  try {
    console.log("Setting up database tables...");
    
    // This will push the schema to the database
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log("Database tables successfully created!");
  } catch (error) {
    console.error("Error setting up database tables:", error);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the setup function
setupDatabase().catch(console.error);