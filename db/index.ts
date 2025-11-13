import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL!);

// Export all schema for migrations
export * from './schema/auth';
export * from './schema/wind-dashboard';