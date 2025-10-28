import pkg from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";
const { Pool } = pkg;

const ca = fs.readFileSync(path.resolve("certs/ca-certificate.crt")).toString();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { ca }
});

export async function testConnection() {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Postgres:", rows[0].now);
  } catch (e) {
    console.error("❌ Database connection failed:", e.message);
  }
}