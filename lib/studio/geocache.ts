import { Prisma, type PrismaClient } from "@prisma/client";

// Provider coordinates are a temporary cache, including copies in private snapshots.
// Purging a cache does not change the owner's content or increment its revision.
export async function purgeExpiredGeocodes(db: PrismaClient, now = new Date()) {
  const cutoff = now.toISOString();
  const fields = [
    { table: "Business", column: "location", root: [] },
    { table: "Business", column: "profileDraft", root: ["location"] },
    ...["draft", "submitted", "config"].map((column) => ({
      table: "BusinessPageConfig",
      column,
      root: ["profile", "location"],
    })),
  ];
  let removed = 0;
  for (const field of fields) {
    // Identifiers and paths come exclusively from the fixed list above.
    const table = Prisma.raw(`"${field.table}"`);
    const column = Prisma.raw(`"${field.column}"`);
    const point = [...field.root, "point"];
    const expiry = [...point, "expiresAt"];
    removed += await db.$executeRaw(Prisma.sql`
      UPDATE ${table}
      SET ${column} = jsonb_set(
        jsonb_set(${column}, ${[...field.root, "geocodeExpiresAt"]}::text[],
          to_jsonb(COALESCE(${column} #>> ${expiry}::text[], ${cutoff}))),
        ${point}::text[], 'null'::jsonb)
      WHERE ${column} #>> ${[...point, "source"]}::text[] = 'google'
        AND (${column} #>> ${expiry}::text[] IS NULL
          OR ${column} #>> ${expiry}::text[] <= ${cutoff})
    `);
  }
  return removed;
}
