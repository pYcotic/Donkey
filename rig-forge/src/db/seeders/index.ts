import { seedUsers } from './users.seeder'
import { seedComponents } from './components.seeder'
import { seedCompatibilityRules } from './compatibility-rules.seeder'
import { seedBuilds } from './builds.seeder'

function getFlag(name: string, fallback = 0) {
  const arg = process.argv.find((x) => x.startsWith(`--${name}`))

  if (!arg) return fallback

  const [, value] = arg.split(/[=:]/)

  return Number(value) || fallback
}

export async function runSeeders() {
  console.log('🌱 Seeding...')

  const users = getFlag('users', 20)
  const components = getFlag('components', 500)
  const builds = getFlag('builds', 100)

  const userIds = await seedUsers(users)

  const componentIds = await seedComponents(components)

  await seedCompatibilityRules()

  await seedBuilds(builds, userIds, componentIds)

  console.log('✅ Done')
}