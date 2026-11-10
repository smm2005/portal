import {
  check,
  boolean,
  date,
  jsonb,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const memberLifecycle = pgEnum('member_lifecycle', [
  'active',
  'deactivated',
])

export const clubLifecycle = pgEnum('club_lifecycle', ['active', 'archived'])

export const resourceCategory = pgEnum('resource_category', [
  'finance',
  'operations',
])

export const members = pgTable(
  'members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    displayName: text('display_name').notNull(),
    lifecycle: memberLifecycle('lifecycle').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'members_email_normalized',
      sql`${table.email} = lower(btrim(${table.email}))`,
    ),
  ],
)

export const administrators = pgTable('administrators', {
  memberId: uuid('member_id')
    .primaryKey()
    .references(() => members.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const boardMembers = pgTable(
  'board_members',
  {
    memberId: uuid('member_id')
      .primaryKey()
      .references(() => members.id, { onDelete: 'restrict' }),
    boardPosition: text('board_position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'board_members_position_nonblank',
      sql`length(btrim(${table.boardPosition})) > 0`,
    ),
    check(
      'board_members_position_trimmed',
      sql`${table.boardPosition} = btrim(${table.boardPosition})`,
    ),
  ],
)

export const clubs = pgTable(
  'clubs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shortName: text('short_name').notNull().unique(),
    fullName: text('full_name').notNull(),
    contactEmail: text('contact_email'),
    lifecycle: clubLifecycle('lifecycle').notNull().default('active'),
    protected: boolean('protected').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'clubs_short_name_nonblank',
      sql`length(btrim(${table.shortName})) > 0`,
    ),
    check(
      'clubs_short_name_trimmed',
      sql`${table.shortName} = btrim(${table.shortName})`,
    ),
    check(
      'clubs_full_name_nonblank',
      sql`length(btrim(${table.fullName})) > 0`,
    ),
  ],
)

export const clubAccess = pgTable(
  'club_access',
  {
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.memberId, table.clubId] })],
)

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    location: text('location').notNull(),
    address: text('address').notNull(),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    owningClubId: uuid('owning_club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'restrict' }),
    creatorMemberId: uuid('creator_member_id').references(() => members.id, {
      onDelete: 'set null',
    }),
    lastEditorMemberId: uuid('last_editor_member_id').references(
      () => members.id,
      {
        onDelete: 'set null',
      },
    ),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check('events_title_nonblank', sql`length(btrim(${table.title})) > 0`),
    check(
      'events_description_nonblank',
      sql`length(btrim(${table.description})) > 0`,
    ),
    check(
      'events_location_nonblank',
      sql`length(btrim(${table.location})) > 0`,
    ),
    check('events_address_nonblank', sql`length(btrim(${table.address})) > 0`),
    check(
      'events_end_after_start',
      sql`${table.endAt} >= ${table.startAt} + interval '1 hour'`,
    ),
  ],
)

export const eventOrganizers = pgTable(
  'event_organizers',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.clubId] })],
)

export const resources = pgTable(
  'resources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    category: resourceCategory('category').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    url: text('url').notNull(),
    displayOrder: integer('display_order').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check('resources_title_nonblank', sql`length(btrim(${table.title})) > 0`),
    check(
      'resources_description_nonblank',
      sql`length(btrim(${table.description})) > 0`,
    ),
    check('resources_url_https', sql`${table.url} ~ '^https://'`),
  ],
)

export const shiftSlots = pgTable(
  'shift_slots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
  },
  (table) => [
    unique('shift_slots_start_end_unique').on(table.startTime, table.endTime),
    check(
      'shift_slots_end_after_start',
      sql`${table.endTime} > ${table.startTime}`,
    ),
  ],
)

// Square Orders and Transactions Log
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }),
    pickupAt: timestamp('order_pickup_at', {withTimezone: true}),
    orderNumber: text('order_number').notNull(),
    customerName: text('customer_name').notNull(),
    customerEmail: text('email'),
    item: text('item').notNull(),
    quantity: integer('quantity'),
    status: text('status'),
    verifiedBy: text('verified_by')
  }
)

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }),
    orderCreatedAt: date('date').notNull(),
    orderNumber: text('order_number').notNull(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id)
  }
)
// End Square Transactions Log

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    date: date('date').notNull(),
    shiftSlotId: uuid('shift_slot_id')
      .notNull()
      .references(() => shiftSlots.id, { onDelete: 'restrict' }),
    displayName: text('display_name').notNull(),
    boardPosition: text('board_position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('bookings_member_date_slot_unique').on(
      table.memberId,
      table.date,
      table.shiftSlotId,
    ),
  ],
)

export const auditEntries = pgTable('audit_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  changedValues: jsonb('changed_values').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
