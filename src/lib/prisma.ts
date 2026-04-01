import { PrismaClient } from "@prisma/client"

const clientSymbol = Symbol.for("prisma-d1-client")

function getClient(): PrismaClient {
  // Try Cloudflare D1 first (production on Workers)
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare")
    const { PrismaD1 } = require("@prisma/adapter-d1")
    const ctx = getCloudflareContext()
    // Cache client on the context for the duration of the request
    if (!(ctx as any)[clientSymbol]) {
      const adapter = new PrismaD1(ctx.env.DB)
      ;(ctx as any)[clientSymbol] = new PrismaClient({ adapter })
    }
    return (ctx as any)[clientSymbol]
  } catch {
    // Not in Cloudflare context — fall back to regular SQLite (local dev)
  }

  const g = globalThis as unknown as { __prisma?: PrismaClient }
  if (!g.__prisma) {
    g.__prisma = new PrismaClient({ log: ["error", "warn"] })
  }
  return g.__prisma
}

// Proxy delegates every property access to the per-request client.
// All existing `import { prisma } from "@/lib/prisma"` continue to work unchanged.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
})

// Export as both 'prisma' and 'db' for compatibility during transition
export const db = prisma
