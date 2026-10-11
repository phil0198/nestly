// Production entrypoint (Railway, Render, Fly or any VPS).
// 1. Points the database, uploads and auth secret at a persistent data directory when one exists.
// 2. Applies migrations and seeds demo data on first boot.
// 3. Starts Next.js on $PORT.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

const env = { ...process.env, NODE_ENV: "production" };
const dataDir = env.DATA_DIR || env.RAILWAY_VOLUME_MOUNT_PATH;

if (dataDir) {
  mkdirSync(dataDir, { recursive: true });
  env.DATABASE_URL ||= `file:${path.join(dataDir, "nestly.db")}`;
  env.UPLOAD_DIR ||= path.join(dataDir, "uploads");
  if (!env.NEXTAUTH_SECRET) {
    const secretFile = path.join(dataDir, ".nextauth-secret");
    if (!existsSync(secretFile)) writeFileSync(secretFile, randomBytes(32).toString("hex"), { mode: 0o600 });
    env.NEXTAUTH_SECRET = readFileSync(secretFile, "utf8").trim();
  }
} else if (env.RAILWAY_ENVIRONMENT) {
  console.warn("⚠ No volume attached: the database resets on every redeploy. Add a volume (see README → Deploy).");
}

// Public URL for sign-in callbacks. Railway and Render expose the domain; otherwise set NEXTAUTH_URL yourself.
const publicHost = env.RAILWAY_PUBLIC_DOMAIN || (env.RENDER_EXTERNAL_HOSTNAME ?? "");
if (!env.NEXTAUTH_URL || env.NEXTAUTH_URL.includes("localhost")) {
  if (publicHost) env.NEXTAUTH_URL = `https://${publicHost}`;
}
env.AUTH_TRUST_HOST ||= "true";
if (!env.NEXTAUTH_SECRET) env.NEXTAUTH_SECRET = randomBytes(32).toString("hex");

const bin = (name) => path.join(process.cwd(), "node_modules", ".bin", name);
function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run(bin("prisma"), ["migrate", "deploy"]);
run(bin("tsx"), ["prisma/seed-if-empty.ts"]);
run(bin("tsx"), ["prisma/refresh-photos.ts"]);

const port = env.PORT || "3000";
console.log(`Starting Nestly on port ${port}${env.NEXTAUTH_URL ? ` (${env.NEXTAUTH_URL})` : ""}`);
const server = spawn(bin("next"), ["start", "-p", port, "-H", "0.0.0.0"], { stdio: "inherit", env });
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => server.kill(sig));
server.on("exit", (code) => process.exit(code ?? 0));
