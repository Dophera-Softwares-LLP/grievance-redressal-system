import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
const { Pool } = pkg;

// ✅ Load CA certificate
const caPath = path.resolve('certs/ca-certificate.crt');
const ca = fs.readFileSync(caPath).toString();

// ✅ Remove sslmode=require if present — Node pg handles SSL directly
const connectionString = process.env.DATABASE_URL.replace('?sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: {
    ca,                  // trust this CA only
    rejectUnauthorized: true, // keep verification ON (secure)
  },
});

try {
  const { rows } = await pool.query('SELECT NOW()');
  console.log('✅ Connected to Postgres:', rows[0].now);
  process.exit(0);
} catch (err) {
  console.error('❌ Connection failed:', err);
  process.exit(1);
}
