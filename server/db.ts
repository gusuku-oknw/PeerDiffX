import { drizzle } from 'drizzle-orm/pg-memory';
import * as schema from "@shared/schema";

// Create in-memory database instance
console.log("Creating in-memory database...");

// Create drizzle instance with schema
export const db = drizzle({ schema });