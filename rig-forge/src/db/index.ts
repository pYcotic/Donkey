import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { env } from '@/env'

// Create pool with config from env
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_MAX_POOL,
  idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT,
  connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT,
  maxUses: 7500, // Number of times a client can be reused before being closed
})


pool.on('connect', () => {
  console.log('🔌 New database connection established')
})

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err)
})

// Create drizzle instance
export const db = drizzle(pool, { schema })

// Export the pool for migrations and closing
export { pool }

export const closeDb = async () => {
  await pool.end()
}