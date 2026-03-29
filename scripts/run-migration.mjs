/**
 * Applies supabase/migrations/*.sql to Postgres using DATABASE_URL.
 *
 * Get the connection string from Supabase: Project Settings → Database → Connection string
 * (URI, use "Transaction" pooler or direct). Add to .env as DATABASE_URL.
 *
 * Usage: npm run db:migrate
 */

import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

dotenv.config({ path: resolve(root, ".env"), quiet: true });
dotenv.config({ path: resolve(root, ".env.local"), quiet: true });

const url = process.env.DATABASE_URL;
const migrationFile = join(root, "supabase", "migrations", "20260329120000_private_rooms_schema.sql");

if (!url) {
  const anonUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (anonUrl && anonKey) {
    const anon = createClient(anonUrl, anonKey);
    const { count, error } = await anon.from("properties").select("*", { count: "exact", head: true });
    if (!error && (count ?? 0) > 0) {
      console.log(
        "No DATABASE_URL: database already has data (anon check). Skipping raw SQL migration.\n" +
          "To apply DDL from a fresh project, set DATABASE_URL or paste supabase/migrations/20260329120000_private_rooms_schema.sql into the SQL Editor."
      );
      process.exit(0);
    }
  }
  console.error(
    "Missing DATABASE_URL in .env.\n" +
      "Supabase → Project Settings → Database → Connection string (URI).\n" +
      "Alternatively, paste the contents of supabase/migrations/20260329120000_private_rooms_schema.sql into the SQL Editor and run it."
  );
  process.exit(1);
}

if (!existsSync(migrationFile)) {
  console.error("Migration file not found:", migrationFile);
  process.exit(1);
}

const sql = readFileSync(migrationFile, "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Applying migration:", migrationFile);
  await client.query(sql);
  console.log("Migration applied successfully.");
} catch (e) {
  console.error("Migration failed:", e.message);
  if (e.message.includes("already exists") || e.code === "42P07") {
    console.error(
      "\nHint: Objects may already exist. If your project was created elsewhere, compare this migration with your live schema or run only missing parts in the SQL Editor."
    );
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
