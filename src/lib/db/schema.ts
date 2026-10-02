import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const transactionTypeEnum = pgEnum('transaction_type', [
  'revenu',
  'depense',
])

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])

export const currencies = pgTable('currencies', {
  code: text('code').primaryKey(),
  nomFr: text('nom_fr').notNull(),
  nomEn: text('nom_en').notNull(),
  decimales: integer('decimales').notNull().default(2),
  tauxVersXof: numeric({ precision: 20, scale: 8 })
    .notNull()
    .default('1'),
  misAJour: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text().unique(),
  email: text().notNull().unique(),
  motDePasseHash: text(),
  languePreferee: text().notNull().default('fr'),
  devisePreferee: text()
    .notNull()
    .default('XOF')
    .references(() => currencies.code, { onDelete: 'restrict' }),
  onboardingTerminee: boolean('onboarding_terminee').notNull().default(false),
  role: userRoleEnum('role').notNull().default('user'),
  derniereActivite: timestamp({ withTimezone: true }),
  dateCreation: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

/**
 * Trafic du site, mesure en interne et sans cookie : on ne stocke ni adresse IP
 * ni identifiant persistant pour les visiteurs anonymes, seulement la page vue
 * et l'utilisateur connecte s'il y en a un.
 */
export const pageViews = pgTable(
  'page_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid().references(() => users.id, { onDelete: 'set null' }),
    chemin: text('chemin').notNull(),
    source: text('source'),
    dateCreation: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('page_views_date_creation_idx').on(table.dateCreation),
    index('page_views_chemin_idx').on(table.chemin),
    index('page_views_user_id_idx').on(table.userId),
  ],
)

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid().references(() => users.id, { onDelete: 'cascade' }),
    nomFr: text().notNull(),
    nomEn: text().notNull(),
    icone: text(),
    couleur: text(),
  },
  (table) => [
    uniqueIndex('categories_user_nom_fr_unique').on(table.userId, table.nomFr),
    uniqueIndex('categories_default_nom_fr_unique')
      .on(table.nomFr)
      .where(sql`${table.userId} is null`),
  ],
)

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    montant: numeric({ precision: 14, scale: 2 }).notNull(),
    devise: text()
      .notNull()
      .default('XOF')
      .references(() => currencies.code, { onDelete: 'restrict' }),
    type: transactionTypeEnum().notNull(),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    date: timestamp({ withTimezone: true }).notNull(),
    note: text(),
    dateCreation: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('transactions_user_date_idx').on(table.userId, table.date),
    index('transactions_user_devise_idx').on(table.userId, table.devise),
  ],
)

export const usersRelations = relations(users, ({ many, one }) => ({
  devisePreferee: one(currencies, {
    fields: [users.devisePreferee],
    references: [currencies.code],
  }),
  categories: many(categories),
  transactions: many(transactions),
  pageViews: many(pageViews),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  devise: one(currencies, {
    fields: [transactions.devise],
    references: [currencies.code],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}))

export type Currency = typeof currencies.$inferSelect
export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type PageView = typeof pageViews.$inferSelect
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number]