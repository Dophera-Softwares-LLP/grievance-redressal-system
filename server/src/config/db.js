// /src/config/db.js
import pkg from "pg";
import fs from "fs";
import "dotenv/config";

const { Pool } = pkg;

// ✅ absolute path inside DigitalOcean App Platform
const caPath = "/workspace/server/certs/ca-certificate.crt";
const ca = fs.readFileSync(caPath, "utf8");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca,
    rejectUnauthorized: false, // 👈 relax verification to avoid 'self-signed certificate in chain'
  },
});

export async function testConnection() {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Postgres:", rows[0].now);
  } catch (e) {
    console.error("❌ Database connection failed:", e.message);
  }
}