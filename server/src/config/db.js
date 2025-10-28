import pkg from 'pg';
const { Pool } = pkg;
import { env } from './env.js';

export const pool = new Pool({ connectionString: env.dbUrl });

export async function query(q, params) {
  const res = await pool.query(q, params);
  return res;
}