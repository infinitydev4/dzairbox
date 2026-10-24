import { PrismaClient } from "@prisma/client";
import { purgeExpiredGeocodes } from "../../lib/studio/geocache.ts";

export default async () => {
  const db = new PrismaClient();
  try {
    const removed = await purgeExpiredGeocodes(db);
    console.log("Expired geocoding caches removed:", removed);
  } finally {
    await db.$disconnect();
  }
};

export const config = { schedule: "@hourly" };
