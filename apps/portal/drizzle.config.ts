import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

config({ path: [join(repoRoot, '.env.local'), join(repoRoot, '.env')]})

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
