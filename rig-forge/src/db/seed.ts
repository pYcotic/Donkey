import { pool } from './index'
import { runSeeders } from './seeders'

await runSeeders()

await pool.end()