import { faker } from '@faker-js/faker'
import { components, type ComponentSpecs } from '../schema'
import { db } from '..'
import { componentTypeEnum } from '../schema'

const componentTypes = componentTypeEnum.enumValues

function generateCpuSpecs(): ComponentSpecs {
  return {
    cpu: {
      cores: faker.number.int({ min: 4, max: 16 }),
      threads: faker.number.int({ min: 8, max: 32 }),
      baseClock: faker.number.int({ min: 2800, max: 4200 }),
      boostClock: faker.number.int({ min: 4500, max: 6000 }),
      socket: faker.helpers.arrayElement(['LGA1700', 'LGA1200', 'AM5', 'AM4']),
      tdp: faker.number.int({ min: 65, max: 250 }),
      integratedGraphics: faker.datatype.boolean(),
      cache: {
        l1: faker.number.int({ min: 64, max: 256 }),
        l2: faker.number.int({ min: 256, max: 1024 }),
        l3: faker.number.int({ min: 8, max: 32 }),
      },
      architecture: faker.helpers.arrayElement(['Zen 4', 'Zen 3', 'Raptor Lake', 'Alder Lake']),
      manufacturingProcess: faker.helpers.arrayElement(['5nm', '7nm', '10nm', '14nm']),
    }
  }
}

function generateGpuSpecs(): ComponentSpecs {
  return {
    gpu: {
      memory: faker.number.int({ min: 4, max: 24 }),
      memoryType: faker.helpers.arrayElement(['GDDR6', 'GDDR6X', 'GDDR7']),
      memoryBus: faker.number.int({ min: 128, max: 384 }),
      coreClock: faker.number.int({ min: 1400, max: 2600 }),
      memoryClock: faker.number.int({ min: 14000, max: 24000 }),
      boostClock: faker.number.int({ min: 1600, max: 2800 }),
      powerConnectors: faker.helpers.arrayElements(['6-pin', '8-pin', '12-pin'], { min: 1, max: 3 }),
      slotWidth: faker.number.float({ min: 2, max: 3.5, multipleOf: 0.5 }),
      length: faker.number.int({ min: 200, max: 350 }),
      tdp: faker.number.int({ min: 120, max: 450 }),
      rayTracing: faker.datatype.boolean(),
      dlssSupport: faker.datatype.boolean(),
    }
  }
}

function generateMotherboardSpecs(): ComponentSpecs {
  return {
    motherboard: {
      socket: faker.helpers.arrayElement(['LGA1700', 'LGA1200', 'AM5', 'AM4']),
      chipset: faker.helpers.arrayElement(['Z790', 'B760', 'X670E', 'B650']),
      formFactor: faker.helpers.arrayElement(['ATX', 'Micro-ATX', 'Mini-ITX']),
      ramType: faker.helpers.arrayElement(['DDR4', 'DDR5']),
      ramSlots: faker.number.int({ min: 2, max: 4 }),
      maxRam: faker.number.int({ min: 64, max: 256 }),
      pcieSlots: {
        x16: faker.number.int({ min: 1, max: 3 }),
        x8: faker.number.int({ min: 0, max: 2 }),
        x4: faker.number.int({ min: 0, max: 2 }),
        x1: faker.number.int({ min: 0, max: 3 }),
      },
      m2Slots: faker.number.int({ min: 1, max: 4 }),
      sataSlots: faker.number.int({ min: 2, max: 8 }),
      wifi: faker.datatype.boolean(),
      bluetooth: faker.datatype.boolean(),
      usbPorts: {
        usb2: faker.number.int({ min: 0, max: 4 }),
        usb3: faker.number.int({ min: 2, max: 8 }),
        usbC: faker.number.int({ min: 0, max: 3 }),
      },
      audioChip: faker.helpers.arrayElement(['Realtek ALC897', 'Realtek ALC1220', 'Realtek ALC4080']),
      ethernet: faker.helpers.arrayElement(['1Gb', '2.5Gb', '10Gb']),
      biosVersion: faker.system.semver(),
    }
  }
}

function generateRamSpecs(): ComponentSpecs {
  return {
    ram: {
      type: faker.helpers.arrayElement(['DDR4', 'DDR5']),
      capacity: faker.number.int({ min: 8, max: 64 }),
      speed: faker.number.int({ min: 3200, max: 8000 }),
      latency: faker.helpers.arrayElement(['CL16', 'CL18', 'CL20', 'CL22', 'CL30', 'CL32', 'CL36']),
      voltage: faker.number.float({ min: 1.2, max: 1.45, multipleOf: 0.05 }),
      rgb: faker.datatype.boolean(),
      heatSpreader: faker.datatype.boolean(),
      ecc: faker.datatype.boolean(),
      registered: faker.datatype.boolean(),
    }
  }
}

function generateStorageSpecs(): ComponentSpecs {
  const storageType = faker.helpers.arrayElement(['SSD', 'NVMe', 'HDD'])
  const isHDD = storageType === 'HDD'
  
  return {
    storage: {
      type: storageType,
      capacity: isHDD 
        ? faker.number.int({ min: 1000, max: 12000 }) 
        : faker.number.int({ min: 256, max: 4000 }),
      readSpeed: isHDD 
        ? faker.number.int({ min: 100, max: 250 }) 
        : faker.number.int({ min: 500, max: 7500 }),
      writeSpeed: isHDD 
        ? faker.number.int({ min: 50, max: 200 }) 
        : faker.number.int({ min: 300, max: 7000 }),
      formFactor: isHDD 
        ? faker.helpers.arrayElement(['3.5"', '2.5"']) 
        : faker.helpers.arrayElement(['M.2', '2.5"']),
      interface: isHDD 
        ? 'SATA' 
        : faker.helpers.arrayElement(['SATA', 'PCIe Gen3', 'PCIe Gen4', 'PCIe Gen5']),
      nandType: isHDD ? undefined : faker.helpers.arrayElement(['TLC', 'QLC', 'MLC']),
      cache: isHDD ? faker.number.int({ min: 64, max: 256 }) : faker.number.int({ min: 512, max: 4096 }),
      rpm: isHDD ? faker.number.int({ min: 5400, max: 7200 }) : undefined,
    }
  }
}

function generatePsuSpecs(): ComponentSpecs {
  return {
    psu: {
      wattage: faker.number.int({ min: 400, max: 1600 }),
      rating: faker.helpers.arrayElement(['Bronze', 'Silver', 'Gold', 'Platinum', 'Titanium']),
      modular: faker.helpers.arrayElement([false, true]),
      atxVersion: faker.helpers.arrayElement(['ATX 2.4', 'ATX 3.0', 'ATX 3.1']),
      efficiency: faker.number.float({ min: 80, max: 95, multipleOf: 0.5 }),
      fan: faker.datatype.boolean(),
      fanless: faker.datatype.boolean({ probability: 0.1 }),
      dimensions: {
        width: faker.number.int({ min: 140, max: 160 }),
        height: faker.number.int({ min: 80, max: 100 }),
        depth: faker.number.int({ min: 140, max: 200 }),
      },
      connectors: {
        motherboard24pin: true,
        cpu8pin: faker.datatype.boolean(),
        cpu4pin: faker.datatype.boolean(),
        pcie6pin: faker.number.int({ min: 0, max: 4 }),
        pcie8pin: faker.number.int({ min: 0, max: 6 }),
        sata: faker.number.int({ min: 4, max: 12 }),
        molex: faker.number.int({ min: 0, max: 4 }),
      },
    }
  }
}

function generateCaseSpecs(): ComponentSpecs {
  return {
    case: {
      formFactor: faker.helpers.arrayElement(['Mid-Tower', 'Full-Tower', 'Mini-Tower']),
      motherboardSupport: faker.helpers.arrayElements(['ATX', 'Micro-ATX', 'Mini-ITX'], { min: 1, max: 3 }),
      psuSupport: faker.helpers.arrayElement(['ATX', 'SFX']),
      gpuClearance: faker.number.int({ min: 250, max: 450 }),
      cpuCoolerClearance: faker.number.int({ min: 120, max: 200 }),
      driveBays: {
        hdd: faker.number.int({ min: 0, max: 4 }),
        ssd: faker.number.int({ min: 0, max: 4 }),
      },
      expansionSlots: faker.number.int({ min: 4, max: 8 }),
      fansIncluded: faker.number.int({ min: 0, max: 4 }),
      maxFans: faker.number.int({ min: 4, max: 10 }),
      radiatorSupport: faker.helpers.arrayElements(['120mm', '240mm', '280mm', '360mm'], { min: 0, max: 3 }),
      usbPorts: {
        usb2: faker.number.int({ min: 0, max: 2 }),
        usb3: faker.number.int({ min: 1, max: 4 }),
        usbC: faker.number.int({ min: 0, max: 2 }),
      },
      audioJack: faker.datatype.boolean(),
      temperedGlass: faker.datatype.boolean(),
      rgb: faker.datatype.boolean(),
      dimensions: {
        width: faker.number.int({ min: 180, max: 250 }),
        height: faker.number.int({ min: 350, max: 600 }),
        depth: faker.number.int({ min: 350, max: 550 }),
      },
      weight: faker.number.float({ min: 3, max: 15, multipleOf: 0.5 }),
      color: faker.helpers.arrayElement(['Black', 'White', 'Silver', 'Gray', 'Red', 'Blue']),
    }
  }
}

function generateCoolerSpecs(): ComponentSpecs {
  const type = faker.helpers.arrayElement(['Air', 'Liquid', 'AIO'])
  
  return {
    cooler: {
      type,
      fanSize: faker.number.int({ min: 80, max: 200 }),
      fanSpeed: faker.number.int({ min: 500, max: 2500 }),
      airflow: faker.number.float({ min: 30, max: 100, multipleOf: 0.5 }),
      noiseLevel: faker.number.float({ min: 15, max: 40, multipleOf: 0.5 }),
      socketSupport: faker.helpers.arrayElements(['LGA1700', 'LGA1200', 'AM5', 'AM4'], { min: 1, max: 4 }),
      radiatorSize: type !== 'Air' ? faker.number.int({ min: 120, max: 420 }) : undefined,
      material: faker.helpers.arrayElement(['Aluminum', 'Copper', 'Nickel-Plated Copper']),
      rgb: faker.datatype.boolean(),
      tdp: faker.number.int({ min: 65, max: 300 }),
      height: type === 'Air' ? faker.number.int({ min: 120, max: 180 }) : undefined,
    }
  }
}

const specGenerators = {
  cpu: generateCpuSpecs,
  gpu: generateGpuSpecs,
  motherboard: generateMotherboardSpecs,
  ram: generateRamSpecs,
  storage: generateStorageSpecs,
  psu: generatePsuSpecs,
  case: generateCaseSpecs,
  cooler: generateCoolerSpecs,
}

export async function seedComponents(count: number) {
  const rows = []
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Corsair', 'EVGA', 'Samsung', 'WD', 'Seagate', 'Kingston', 'G.Skill', 'Thermaltake', 'Cooler Master', 'Noctua', 'be quiet!']

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(componentTypes)
    const brand = faker.helpers.arrayElement(brands)
    const model = `${faker.string.alpha({ length: { min: 2, max: 4 }}) }}-${faker.string.numeric({ length: { min: 3, max: 6 } })}`
    const specs = specGenerators[type as keyof typeof specGenerators]()
    
    rows.push({
      type,
      brand,
      model,
      price: faker.number.int({ min: 2000, max: 200000 }),
      imageUrl: `https://picsum.photos/seed/${type}-${i}/400/400`,
      specs,
      inStock: faker.datatype.boolean({ probability: 0.8 }),
      stockQuantity: faker.number.int({ min: 0, max: 100 }),
      releaseDate: faker.date.past({ years: 2 }),
      discontinued: faker.datatype.boolean({ probability: 0.05 }),
    })
  }

  const inserted = await db
    .insert(components)
    .values(rows)
    .returning({ id: components.id })

  console.log(`✅ Seeded ${inserted.length} components`)

  return inserted.map(x => x.id)
}