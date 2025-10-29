import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from './env.js';
const { Pool } = pkg;

console.log('🧩 Connecting to Postgres...');
// console.log('🔗 URL:', env.dbUrl);

const caPath = path.resolve('certs/ca-certificate.crt');
const ca = fs.readFileSync(caPath).toString();

export const pool = new Pool({
  connectionString: env.dbUrl.replace('?sslmode=require', ''),
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
});

export async function query(q, params) {
  const res = await pool.query(q, params);
  return res;
}