import { faker } from '@faker-js/faker'
import { builds, buildComponents, buildValidations, buildStatusEnum } from '../schema'
import { db } from '..'

const buildStatuses = buildStatusEnum.enumValues

export async function seedBuilds(
  count: number,
  userIds: number[],
  componentIds: number[]
) {
  const buildRows = []
  const buildComponentRows = []
  const buildValidationRows = []

  for (let i = 0; i < count; i++) {
    const userId = faker.helpers.arrayElement(userIds)
    const status = faker.helpers.arrayElement(buildStatuses)
    const isPublic = faker.datatype.boolean()
    const componentsCount = faker.number.int({ min: 3, max: 8 })

    // Randomly select components for this build
    const selectedComponentIds = faker.helpers.arrayElements(
      componentIds,
      { min: 3, max: 8 }
    )

    // Calculate total price
    const componentsInBuild = await db.query.components.findMany({
      where: (components, { inArray }) => inArray(components.id, selectedComponentIds),
    })

    const totalPrice = componentsInBuild.reduce(
      (sum, comp) => sum + comp.price,
      0
    )

    const build = {
      userId,
      name: faker.helpers.arrayElement([
        'Gaming PC',
        'Workstation',
        'Budget Build',
        'Content Creation',
        'Server',
        'Mini-ITX Build',
        'RGB Build',
        'Silent Build',
      ]) + ` ${faker.number.int({ min: 1, max: 100 })}`,
      description: faker.lorem.sentence(),
      status,
      totalPrice,
      isPublic,
      viewCount: faker.number.int({ min: 0, max: 10000 }),
      completedAt: status === 'completed' ? faker.date.recent({ days: 30 }) : undefined,
    }

    const [insertedBuild] = await db
      .insert(builds)
      .values(build)
      .returning()

    // Add build components
    for (const componentId of selectedComponentIds) {
      buildComponentRows.push({
        buildId: insertedBuild.id,
        componentId,
        quantity: faker.number.int({ min: 1, max: 2 }),
        notes: faker.helpers.maybe(() => faker.lorem.sentence()),
      })
    }

    // Add build validation
    const isValid = faker.datatype.boolean({ probability: 0.85 })
    buildValidationRows.push({
      buildId: insertedBuild.id,
      isValid,
      errors: isValid ? null : JSON.stringify([
        {
          type: 'compatibility',
          message: faker.helpers.arrayElement([
            'CPU and motherboard sockets do not match',
            'RAM type is incompatible with motherboard',
            'GPU is too large for the case',
            'PSU wattage is insufficient',
            'Cooler is incompatible with CPU socket',
          ]),
          componentId: faker.helpers.arrayElement(selectedComponentIds),
        },
      ]),
      warnings: faker.helpers.maybe(() => 
        JSON.stringify([
          {
            type: 'recommendation',
            message: faker.helpers.arrayElement([
              'Consider a higher wattage PSU for future upgrades',
              'Cooling might be insufficient for this CPU',
              'Case might not fit all drives',
              'RAM speed is not optimal for this CPU',
            ]),
          },
        ]),
        { probability: 0.3 }
      ),
    })
  }

  // Insert build components and validations
  if (buildComponentRows.length > 0) {
    await db.insert(buildComponents).values(buildComponentRows)
  }

  if (buildValidationRows.length > 0) {
    await db.insert(buildValidations).values(buildValidationRows)
  }

  console.log(`✅ Seeded ${buildRows.length} builds`)
  console.log(`✅ Seeded ${buildComponentRows.length} build components`)
  console.log(`✅ Seeded ${buildValidationRows.length} build validations`)
}