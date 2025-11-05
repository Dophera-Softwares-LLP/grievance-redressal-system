import { query } from '../config/db.js';

export async function findUserByUid(uid) {
  const { rows } = await query('SELECT * FROM users WHERE uid=$1', [uid]);
  return rows[0] || null;
}

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  return rows[0] || null;
}

export async function createUser({ uid, email, name }) {
  
  // 1️⃣ Insert user into users table (or update if email already exists)
  const { rows } = await query(
    `INSERT INTO users (uid, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [uid, email, name]
  );
  const user = rows[0];

  // 2️⃣ Fetch student role_id
  const { rows: roleRows } = await query(
    `SELECT id FROM roles WHERE code = 'student'`
  );
  const studentRoleId = roleRows[0]?.id;
  if (!studentRoleId) throw new Error("Student role not found");

  // 3️⃣ Assign 'student' role to this user in user_roles table
  await query(
    `INSERT INTO user_roles (user_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, role_id) DO NOTHING`,
    [user.id, studentRoleId]
  );

  // 4️⃣ Assign default mentor (id = 4) in mentorship table
  await query(
    `INSERT INTO mentorship (student_id, mentor_id)
     VALUES ($1, 4)
     ON CONFLICT (student_id, mentor_id) DO NOTHING`,
    [user.id]
  );

  // 5️⃣ Return user record
  return user;
}