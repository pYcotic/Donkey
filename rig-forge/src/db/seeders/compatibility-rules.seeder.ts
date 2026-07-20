import { compatibilityRules } from '../schema'
import { db } from '..'
import { componentTypeEnum, compatibilityLevelEnum } from '../schema'
import { eq, and } from 'drizzle-orm'

type ComponentType = typeof componentTypeEnum.enumValues[number]
type CompatibilityLevel = typeof compatibilityLevelEnum.enumValues[number]

interface Rule {
  componentType: ComponentType
  compatibleWith: ComponentType
  rule: string
  requiredValue: string
  level: CompatibilityLevel
  description: string
}

export async function seedCompatibilityRules() {
  console.log('🌱 Seeding compatibility rules...')

  const rules: Rule[] = [
    // CPU - Motherboard
    {
      componentType: 'cpu',
      compatibleWith: 'motherboard',
      rule: 'socket',
      requiredValue: 'LGA1700,AM5,AM4',
      level: 'required',
      description: 'CPU socket must match motherboard socket',
    },

    // RAM - Motherboard
    {
      componentType: 'ram',
      compatibleWith: 'motherboard',
      rule: 'ramType',
      requiredValue: 'DDR4,DDR5',
      level: 'required',
      description: 'RAM type must match motherboard RAM type',
    },

    // Motherboard - Case
    {
      componentType: 'motherboard',
      compatibleWith: 'case',
      rule: 'formFactor',
      requiredValue: 'ATX,Micro-ATX,Mini-ITX',
      level: 'required',
      description: 'Motherboard form factor must fit in case',
    },

    // PSU - Case
    {
      componentType: 'psu',
      compatibleWith: 'case',
      rule: 'psuSupport',
      requiredValue: 'ATX,SFX',
      level: 'required',
      description: 'PSU form factor must fit in case',
    },

    // CPU - Cooler
    {
      componentType: 'cpu',
      compatibleWith: 'cooler',
      rule: 'socketSupport',
      requiredValue: 'LGA1700,AM5',
      level: 'required',
      description: 'Cooler must support CPU socket',
    },

    // Storage - Motherboard
    {
      componentType: 'storage',
      compatibleWith: 'motherboard',
      rule: 'interface',
      requiredValue: 'SATA',
      level: 'required',
      description: 'Storage interface must be supported by motherboard',
    },
    {
      componentType: 'storage',
      compatibleWith: 'motherboard',
      rule: 'interface',
      requiredValue: 'PCIe Gen4',
      level: 'recommended',
      description: 'Storage interface should be supported by motherboard',
    },

    // GPU - Case
    {
      componentType: 'gpu',
      compatibleWith: 'case',
      rule: 'gpuClearance',
      requiredValue: 'gpuLength',
      level: 'required',
      description: 'GPU length must fit in case',
    },

    // CPU Cooler - Case
    {
      componentType: 'cooler',
      compatibleWith: 'case',
      rule: 'coolerHeight',
      requiredValue: 'cpuCoolerClearance',
      level: 'required',
      description: 'CPU cooler height must fit in case',
    },

    // PSU - GPU
    {
      componentType: 'psu',
      compatibleWith: 'gpu',
      rule: 'wattage',
      requiredValue: 'gpuTdp',
      level: 'required',
      description: 'PSU wattage must meet GPU power requirements',
    },

    // Bidirectional rules (for easier lookups)
    {
      componentType: 'motherboard',
      compatibleWith: 'cpu',
      rule: 'socket',
      requiredValue: 'LGA1700,AM5,AM4',
      level: 'required',
      description: 'Motherboard socket must match CPU socket',
    },
    {
      componentType: 'motherboard',
      compatibleWith: 'ram',
      rule: 'ramType',
      requiredValue: 'DDR4,DDR5',
      level: 'required',
      description: 'Motherboard RAM type must match RAM',
    },
    {
      componentType: 'case',
      compatibleWith: 'motherboard',
      rule: 'formFactor',
      requiredValue: 'ATX,Micro-ATX,Mini-ITX',
      level: 'required',
      description: 'Case must support motherboard form factor',
    },
    {
      componentType: 'case',
      compatibleWith: 'psu',
      rule: 'psuSupport',
      requiredValue: 'ATX,SFX',
      level: 'required',
      description: 'Case must support PSU form factor',
    },
    {
      componentType: 'cooler',
      compatibleWith: 'cpu',
      rule: 'socketSupport',
      requiredValue: 'LGA1700,AM5',
      level: 'required',
      description: 'Cooler must support CPU socket',
    },
    {
      componentType: 'gpu',
      compatibleWith: 'psu',
      rule: 'wattage',
      requiredValue: 'gpuTdp',
      level: 'required',
      description: 'GPU power requirements must be met by PSU',
    },
  ]

  try {
    // Clear existing rules (optional - comment out if you want to keep existing)
    console.log('🗑️ Clearing existing rules...')
    await db.delete(compatibilityRules)

    // Insert rules with upsert
    console.log(`📥 Inserting ${rules.length} rules...`)
    const inserted = []
    
    for (const rule of rules) {
      try {
        // Check if rule already exists
        const existing = await db
          .select()
          .from(compatibilityRules)
          .where(
            and(
              eq(compatibilityRules.componentType, rule.componentType),
              eq(compatibilityRules.compatibleWith, rule.compatibleWith),
              eq(compatibilityRules.rule, rule.rule)
            )
          )
          .limit(1)

        let result

        if (existing.length > 0) {
          // Update existing rule
          console.log(`🔄 Updating: ${rule.componentType}->${rule.compatibleWith} (${rule.rule})`)
          const [updated] = await db
            .update(compatibilityRules)
            .set({
              requiredValue: rule.requiredValue,
              level: rule.level,
              description: rule.description,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(compatibilityRules.componentType, rule.componentType),
                eq(compatibilityRules.compatibleWith, rule.compatibleWith),
                eq(compatibilityRules.rule, rule.rule)
              )
            )
            .returning()
          result = updated
        } else {
          // Insert new rule
          console.log(`➕ Inserting: ${rule.componentType}->${rule.compatibleWith} (${rule.rule})`)
          const [inserted] = await db
            .insert(compatibilityRules)
            .values(rule)
            .returning()
          result = inserted
        }

        if (result) {
          inserted.push(result)
        }
      } catch (err) {
        console.warn(`⚠️ Failed to upsert rule: ${rule.componentType}->${rule.compatibleWith} (${rule.rule})`)
        if (err instanceof Error) {
          console.warn(`  Error: ${err.message}`)
        }
      }
    }

    console.log(`✅ Seeded ${inserted.length} compatibility rules`)

    // Verify what was inserted
    const allRules = await db.select().from(compatibilityRules)
    console.log(`📊 Total rules in database: ${allRules.length}`)

    // Log a summary
    const summary = allRules.reduce((acc, rule) => {
      const key = `${rule.componentType}→${rule.compatibleWith}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('📊 Summary by relationship:')
    Object.entries(summary)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([relationship, count]) => {
        console.log(`  ${relationship}: ${count} rule(s)`)
      })

    return inserted.map(x => x.id)
  } catch (error) {
    console.error('❌ Failed to seed compatibility rules:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }
    throw error
  }
}

// Export a function to run just this seeder
export async function runCompatibilityRulesSeeder() {
  try {
    await seedCompatibilityRules()
    console.log('✅ Compatibility rules seeder completed successfully!')
  } catch (error) {
    console.error('❌ Compatibility rules seeder failed:', error)
    process.exit(1)
  }
  process.exit(0)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompatibilityRulesSeeder()
}