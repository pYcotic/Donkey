import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  unique,
  index,
  boolean,
} from 'drizzle-orm/pg-core'

/* -----------------------------
   ENUMS
------------------------------ */
export const componentTypeEnum = pgEnum('component_type', [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'case',
  'cooler',
])

export const buildStatusEnum = pgEnum('build_status', [
  'draft',
  'completed',
  'archived',
  'shared',
])

export const compatibilityLevelEnum = pgEnum('compatibility_level', [
  'required',
  'recommended',
  'optional',
])

/* -----------------------------
   USERS
------------------------------ */
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    usernameIdx: index('users_username_idx').on(table.username),
  })
)

/* -----------------------------
   SESSIONS
------------------------------ */
export const sessions = pgTable(
  'sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index('sessions_token_idx').on(table.token),
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  })
)

/* -----------------------------
   COMPONENTS (UNIFIED TABLE)
------------------------------ */
export const components = pgTable(
  'components',
  {
    id: serial('id').primaryKey(),
    type: componentTypeEnum('type').notNull(),
    brand: text('brand').notNull(),
    model: text('model').notNull(),
    price: integer('price').notNull(),
    imageUrl: text('image_url'),
    specs: jsonb('specs').notNull(),
    inStock: boolean('in_stock').default(true).notNull(),
    stockQuantity: integer('stock_quantity').default(0).notNull(),
    releaseDate: timestamp('release_date'),
    discontinued: boolean('discontinued').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    uniqueComponent: unique().on(table.type, table.brand, table.model),
    typeIdx: index('components_type_idx').on(table.type),
    brandIdx: index('components_brand_idx').on(table.brand),
    priceIdx: index('components_price_idx').on(table.price),
    inStockIdx: index('components_in_stock_idx').on(table.inStock),
  })
)

/* -----------------------------
   COMPATIBILITY RULES
------------------------------ */
export const compatibilityRules = pgTable(
  'compatibility_rules',
  {
    id: serial('id').primaryKey(),
    componentType: componentTypeEnum('component_type').notNull(),
    compatibleWith: componentTypeEnum('compatible_with').notNull(),
    rule: text('rule').notNull(), // e.g., "socket_type", "form_factor", "ram_type"
    requiredValue: text('required_value').notNull(),
    level: compatibilityLevelEnum('level').default('required').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('compatibility_rules_type_idx').on(table.componentType),
    compatibleIdx: index('compatibility_rules_compatible_idx').on(table.compatibleWith),
    uniqueRule: unique().on(table.componentType, table.compatibleWith, table.rule),
  })
)

/* -----------------------------
   BUILDS
------------------------------ */
export const builds = pgTable(
  'builds',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    status: buildStatusEnum('status').default('draft').notNull(),
    totalPrice: integer('total_price').default(0),
    isPublic: boolean('is_public').default(false).notNull(),
    viewCount: integer('view_count').default(0),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('builds_user_id_idx').on(table.userId),
    statusIdx: index('builds_status_idx').on(table.status),
    isPublicIdx: index('builds_is_public_idx').on(table.isPublic),
  })
)

/* -----------------------------
   BUILD COMPONENTS
------------------------------ */
export const buildComponents = pgTable(
  'build_components',
  {
    id: serial('id').primaryKey(),
    buildId: integer('build_id')
      .notNull()
      .references(() => builds.id, { onDelete: 'cascade' }),
    componentId: integer('component_id')
      .notNull()
      .references(() => components.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(1).notNull(),
    notes: text('notes'),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    buildIdIdx: index('build_components_build_id_idx').on(table.buildId),
    componentIdIdx: index('build_components_component_id_idx').on(table.componentId),
    uniqueBuildComponent: unique().on(table.buildId, table.componentId),
  })
)

/* -----------------------------
   BUILD HISTORY
------------------------------ */
export const buildHistory = pgTable(
  'build_history',
  {
    id: serial('id').primaryKey(),
    buildId: integer('build_id')
      .notNull()
      .references(() => builds.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(), // 'added', 'removed', 'updated', 'created', 'completed'
    componentId: integer('component_id').references(() => components.id),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    buildIdIdx: index('build_history_build_id_idx').on(table.buildId),
    userIdIdx: index('build_history_user_id_idx').on(table.userId),
    createdAtIdx: index('build_history_created_at_idx').on(table.createdAt),
  })
)

/* -----------------------------
   BUILD REVIEWS
------------------------------ */
export const buildReviews = pgTable(
  'build_reviews',
  {
    id: serial('id').primaryKey(),
    buildId: integer('build_id')
      .notNull()
      .references(() => builds.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    buildIdIdx: index('build_reviews_build_id_idx').on(table.buildId),
    userIdIdx: index('build_reviews_user_id_idx').on(table.userId),
    uniqueUserBuild: unique().on(table.buildId, table.userId),
  })
)

/* -----------------------------
   BUILD VALIDATIONS
------------------------------ */
export const buildValidations = pgTable(
  'build_validations',
  {
    id: serial('id').primaryKey(),
    buildId: integer('build_id')
      .notNull()
      .references(() => builds.id, { onDelete: 'cascade' }),
    isValid: boolean('is_valid').default(true).notNull(),
    errors: jsonb('errors'), // Array of error objects
    warnings: jsonb('warnings'), // Array of warning objects
    validatedAt: timestamp('validated_at').defaultNow().notNull(),
  },
  (table) => ({
    buildIdIdx: index('build_validations_build_id_idx').on(table.buildId),
    isValidIdx: index('build_validations_is_valid_idx').on(table.isValid),
    uniqueBuild: unique().on(table.buildId),
  })
)

/* -----------------------------
   COMPONENT INVENTORY (for tracking stock changes)
------------------------------ */
export const componentInventory = pgTable(
  'component_inventory',
  {
    id: serial('id').primaryKey(),
    componentId: integer('component_id')
      .notNull()
      .references(() => components.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(0).notNull(),
    reservedQuantity: integer('reserved_quantity').default(0).notNull(),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
    updatedBy: integer('updated_by').references(() => users.id),
  },
  (table) => ({
    componentIdIdx: index('component_inventory_component_id_idx').on(table.componentId),
    uniqueComponent: unique().on(table.componentId),
  })
)

/* -----------------------------
   TYPE DEFINITIONS
------------------------------ */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type Component = typeof components.$inferSelect
export type NewComponent = typeof components.$inferInsert

export type Build = typeof builds.$inferSelect
export type NewBuild = typeof builds.$inferInsert

export type BuildComponent = typeof buildComponents.$inferSelect
export type NewBuildComponent = typeof buildComponents.$inferInsert

export type CompatibilityRule = typeof compatibilityRules.$inferSelect
export type NewCompatibilityRule = typeof compatibilityRules.$inferInsert

export type BuildValidation = typeof buildValidations.$inferSelect
export type NewBuildValidation = typeof buildValidations.$inferInsert

// Component specs type helpers
export type ComponentSpecs = {
  // CPU
  cpu?: {
    cores: number
    threads: number
    baseClock: number // MHz
    boostClock: number // MHz
    socket: string
    tdp: number // Watts
    integratedGraphics: boolean
    cache: {
      l1: number
      l2: number
      l3: number
    }
    architecture: string
    manufacturingProcess: string // nm
  }

  // GPU
  gpu?: {
    memory: number // GB
    memoryType: string // GDDR6, etc.
    memoryBus: number // bits
    coreClock: number // MHz
    memoryClock: number // MHz
    boostClock: number // MHz
    powerConnectors: string[] // e.g., ['8-pin', '6-pin']
    slotWidth: number // 2, 2.5, 3 slots
    length: number // mm
    tdp: number // Watts
    rayTracing: boolean
    dlssSupport: boolean
  }

  // Motherboard
  motherboard?: {
    socket: string
    chipset: string
    formFactor: string // ATX, mATX, ITX, etc.
    ramType: string // DDR4, DDR5
    ramSlots: number
    maxRam: number // GB
    pcieSlots: {
      x16: number
      x8: number
      x4: number
      x1: number
    }
    m2Slots: number
    sataSlots: number
    wifi: boolean
    bluetooth: boolean
    usbPorts: {
      usb2: number
      usb3: number
      usbC: number
    }
    audioChip: string
    ethernet: string // 1Gb, 2.5Gb, etc.
    biosVersion: string
  }

  // RAM
  ram?: {
    type: string // DDR4, DDR5
    capacity: number // GB
    speed: number // MHz
    latency: string // e.g., CL16-18-18-38
    voltage: number // Volts
    rgb: boolean
    heatSpreader: boolean
    ecc: boolean
    registered: boolean
  }

  // Storage
  storage?: {
    type: string // SSD, HDD, NVMe, etc.
    capacity: number // GB
    readSpeed: number // MB/s
    writeSpeed: number // MB/s
    formFactor: string // M.2, 2.5", 3.5"
    interface: string // SATA, PCIe Gen3, Gen4, etc.
    nandType?: string // TLC, QLC, etc.
    cache: number // MB
    rpm?: number // for HDDs
  }

  // PSU
  psu?: {
    wattage: number // Watts
    rating: string // Bronze, Gold, Platinum, Titanium
    modular: boolean
    atxVersion: string
    efficiency: number // percentage
    fan: boolean
    fanless: boolean
    dimensions: {
      width: number // mm
      height: number // mm
      depth: number // mm
    }
    connectors: {
      motherboard24pin: boolean
      cpu8pin: boolean
      cpu4pin: boolean
      pcie6pin: number
      pcie8pin: number
      sata: number
      molex: number
    }
  }

  // Case
  case?: {
    formFactor: string // ATX, mATX, ITX, etc.
    motherboardSupport: string[] // e.g., ['ATX', 'mATX']
    psuSupport: string // e.g., 'ATX'
    gpuClearance: number // mm
    cpuCoolerClearance: number // mm
    driveBays: {
      hdd: number
      ssd: number
    }
    expansionSlots: number
    fansIncluded: number
    maxFans: number
    radiatorSupport: string[] // e.g., ['120mm', '240mm']
    usbPorts: {
      usb2: number
      usb3: number
      usbC: number
    }
    audioJack: boolean
    temperedGlass: boolean
    rgb: boolean
    dimensions: {
      width: number // mm
      height: number // mm
      depth: number // mm
    }
    weight: number // kg
    color: string
  }

  // Cooler
  cooler?: {
    type: string // Air, Liquid, AIO
    fanSize: number // mm
    fanSpeed: number // RPM
    airflow: number // CFM
    noiseLevel: number // dB
    socketSupport: string[] // e.g., ['LGA1700', 'AM5']
    radiatorSize?: number // mm (for liquid coolers)
    material: string // Aluminum, Copper
    rgb: boolean
    tdp: number // Watts
    height?: number // mm (for air coolers)
  }
}