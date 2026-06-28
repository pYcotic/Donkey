import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'

/* -----------------------------
   USERS
------------------------------ */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* -----------------------------
   SESSIONS
------------------------------ */
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* -----------------------------
   COMPONENT TYPE
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

/* -----------------------------
   COMPONENTS (UNIFIED TABLE)
------------------------------ */
export const components = pgTable('components', {
  id: serial('id').primaryKey(),

  type: componentTypeEnum('type').notNull(),

  brand: text('brand').notNull(),
  model: text('model').notNull(),

  price: integer('price').notNull(),

  imageUrl: text('image_url'),

  /* FLEXIBLE SPECS PER TYPE */
  specs: jsonb('specs').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* -----------------------------
   BUILDS
------------------------------ */
export const builds = pgTable('builds', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* -----------------------------
   BUILD COMPONENTS
------------------------------ */
export const buildComponents = pgTable('build_components', {
  id: serial('id').primaryKey(),

  buildId: integer('build_id')
    .notNull()
    .references(() => builds.id, { onDelete: 'cascade' }),

  componentId: integer('component_id')
    .notNull()
    .references(() => components.id, { onDelete: 'cascade' }),

  quantity: integer('quantity').default(1).notNull(),
})