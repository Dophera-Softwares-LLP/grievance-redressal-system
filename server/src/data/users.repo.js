import { query } from '../config/db.js';

export async function findUserByUid(uid) {
  const { rows } = await query('SELECT * FROM users WHERE uid=$1', [uid]);
  return rows[0] || null;
}

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  return rows[0] || null;
}

export async function createUser({ uid, email, name, role = 'student' }) {
  const { rows } = await query(
    `INSERT INTO users (uid,email,name,role) VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
     RETURNING *`,
    [uid, email, name, role]
  );
  return rows[0];
}