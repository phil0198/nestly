import { PrismaClient } from "@prisma/client";

/** Seeds demo data only when the database has no users, so redeploys never wipe real bookings. */
async function run() {
  const prisma = new PrismaClient();
  const users = await prisma.user.count();
  await prisma.$disconnect();
  if (users > 0) {
    console.log(`Database already has ${users} users; skipping seed.`);
    return;
  }
  console.log("Empty database; loading demo data…");
  await import("./seed");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
