// src/config/db.js
import pkg from "pg";
import "dotenv/config";

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for DigitalOcean managed PG
});

export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Postgres:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}