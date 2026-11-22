import { fileURLToPath } from 'node:url'

import { sql } from 'drizzle-orm'

import { getDb } from '../index.ts'
import {
  importLegacyExport,
  loadLegacyExport,
} from '../../migrations/legacy/import.ts'
import { importResourcesSeed, loadResourcesSeed } from './import-resources.ts'
import {
  importShiftSlotsSeed,
  loadShiftSlotsSeed,
} from './import-shift-slots.ts'
import { ensureUsstmClub } from './usstm-club.ts'

const representativeFixturesPath = fileURLToPath(
  new URL('../../migrations/legacy/fixtures/representative/', import.meta.url),
)

const MUTABLE_TABLES = [
  'administrators',
  'audit_entries',
  'board_members',
  'bookings',
  'club_access',
  'clubs',
  'event_organizers',
  'events',
  'members',
  'orders',
  'resources',
  'shift_slots',
]

export function assertTestDatabase(): void {
  const connectionString = process.env.DATABASE_URL ?? ''
  const databaseName = new URL(connectionString).pathname.replace(/^\//, '')
  if (!databaseName.includes('test')) {
    throw new Error(
      `Refusing to reset database "${databaseName}": DATABASE_URL must point at a ` +
        'test database (name containing "test").',
    )
  }
}

export interface BaselineReport {
  legacy: {
    clubs: number
    events: number
    organizers: number
  }
  resources: number
  shiftSlots: number
}

/**
 * Truncates every mutable table and reseeds it to the production day-one
 * baseline: legacy Clubs/Events/Organizers (representative fixtures) plus the
 * curated Resources and Office Hours Shift Slots.
 */
export async function resetDatabaseToBaseline(): Promise<BaselineReport> {
  assertTestDatabase()

  await getDb().execute(
    sql.raw(
      `TRUNCATE TABLE ${MUTABLE_TABLES.join(', ')} RESTART IDENTITY CASCADE;`,
    ),
  )

  await ensureUsstmClub()

  const legacyExport = await loadLegacyExport(representativeFixturesPath)
  const legacyReport = await importLegacyExport(legacyExport)

  const resourcesSeed = await loadResourcesSeed()
  const resourcesReport = await importResourcesSeed(resourcesSeed)

  const shiftSlotsSeed = await loadShiftSlotsSeed()
  const shiftSlotsReport = await importShiftSlotsSeed(shiftSlotsSeed)

  return {
    legacy: legacyReport.database.inserted,
    resources: resourcesReport.inserted,
    shiftSlots: shiftSlotsReport.inserted,
  }
}
