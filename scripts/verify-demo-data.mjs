/**
 * Read-only check that demo data is visible via the anon key (same as the app).
 * Run after: npm run seed:demo
 *
 * Usage: npm run verify:demo
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

dotenv.config({ path: resolve(root, ".env"), quiet: true });
dotenv.config({ path: resolve(root, ".env.local"), quiet: true });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, anon);

// Tables that allow meaningful anon SELECT under current RLS (browse + public reviews)
const tables = ["properties", "reviews"];

async function countRows(table) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) return { table, error: error.message, count: null };
  return { table, count };
}

console.log("Verifying data visible with anon key (RLS applies)…\n");

const results = [];
for (const t of tables) {
  results.push(await countRows(t));
}

let ok = true;
for (const r of results) {
  if (r.error) {
    console.log(`  ${r.table}: ERROR — ${r.error}`);
    ok = false;
  } else {
    console.log(`  ${r.table}: ${r.count ?? 0} rows`);
  }
}

const props = results.find((x) => x.table === "properties");
if (props && props.count > 0) {
  console.log("\nOK: Listings are readable (guest browse path).");
} else if (ok) {
  console.log("\nNo properties yet — run npm run seed:demo (requires SUPABASE_SERVICE_ROLE_KEY).");
}

if (!ok) process.exit(1);
process.exit(0);
