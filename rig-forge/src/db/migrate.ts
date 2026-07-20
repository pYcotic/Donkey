import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '@/env'

async function main() {
  console.log('⏳ Running migrations...')
  
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 1,
    // Add these for debugging
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  })
  
  const db = drizzle(pool)
  
  try {
    // Test connection first
    console.log('🔌 Testing database connection...')
    const client = await pool.connect()
    const result = await client.query('SELECT version() as version')
    console.log('✅ Connected to PostgreSQL:', result.rows[0].version)
    client.release()
    
    // Check if migrations table exists
    console.log('📋 Checking migrations...')
    const migrationsResult = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations') as exists"
    )
    console.log('Migrations table exists:', migrationsResult.rows[0].exists)
    
    // Run migrations with more verbose logging
    console.log('📦 Running migrations from ./drizzle...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:')
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    } else {
      console.error('Unknown error:', error)
    }
    process.exit(1)
  }
  
  await pool.end()
  process.exit(0)
}

main()