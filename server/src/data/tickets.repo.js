import { query } from '../config/db.js';

// 1️⃣ Insert the core ticket row
export async function insertTicket({ title, description, categoryId, studentId }) {
  const { rows } = await query(
    `INSERT INTO tickets (title, description, category_id, student_id, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'open', NOW(), NOW())
     RETURNING *`,
    [title, description, categoryId, studentId]
  );
  return rows[0];
}

// 2️⃣ Insert the first assignment (who handles it)
export async function insertAssignment({ ticketId, roleId, userId, dueAt }) {
  const { rows } = await query(
    `INSERT INTO ticket_assignments (ticket_id, role_id, user_id, action, due_at, started_at, is_current)
     VALUES ($1, $2, $3, 'assign', $4, NOW(), true)
     RETURNING *`,
    [ticketId, roleId, userId, dueAt]
  );
  return rows[0];
}

// 3️⃣ Insert 0..N attachment rows
export async function insertAttachments({ ticketId, uploaderId, urls }) {
  if (!urls?.length) return [];
  const values = [];
  const params = [];
  let idx = 1;
  for (const url of urls) {
    params.push(ticketId, uploaderId, url);
    values.push(`($${idx++}, $${idx++}, $${idx++}, 'ticket')`);
  }
  const { rows } = await query(
    `INSERT INTO attachments (ticket_id, uploaded_by, url, kind)
     VALUES ${values.join(',')}
     RETURNING *`,
    params
  );
  return rows;
}

// 4️⃣ Get all tickets created by a specific student
export async function getMyTickets(studentId, status) {
  const sql = status
    ? `
      SELECT 
        t.*,
        c.name AS category_name,
        ta.due_at,
        ta.user_id AS current_assignee_id
      FROM tickets t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.is_current = true
      WHERE t.student_id = $1 AND t.status = $2
      ORDER BY t.updated_at DESC
    `
    : `
      SELECT 
        t.*,
        c.name AS category_name,
        ta.due_at,
        ta.user_id AS current_assignee_id
      FROM tickets t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.is_current = true
      WHERE t.student_id = $1
      ORDER BY t.updated_at DESC
    `;
  const { rows } = await query(sql, status ? [studentId, status] : [studentId]);
  return rows;
}

// 5️⃣ Get tickets assigned to a user (direct or role-based visibility)
export async function getAssignedTickets(userId) {
  const { rows } = await query(
    `
    SELECT 
      t.id,
      t.title,
      t.status,
      t.updated_at,
      ta.due_at,
      c.name AS category_name,
      s.name AS student_name,
      s.roll_number AS student_roll
    FROM tickets t
    JOIN ticket_assignments ta 
      ON ta.ticket_id = t.id 
      AND ta.is_current = true
    LEFT JOIN categories c 
      ON t.category_id = c.id
    LEFT JOIN users s 
      ON t.student_id = s.id
    WHERE 
      (
        -- ✅ Case 1: the user is explicitly assigned
        ta.user_id = $1
        OR
        -- ✅ Case 2: role-based visibility
        ta.role_id IN (
          SELECT ur.role_id
          FROM user_roles ur
          WHERE ur.user_id = $1
            AND ur.role_id IN (
              SELECT id FROM roles WHERE code IN (
                'warden',
                'chief_warden',
                'mess_incharge',
                'laundry_incharge',
                'posh_committee',
                'disciplinary_committee',
                'transport_incharge',
                'council',
                'council_head',
                'vc'
              )
            )
        )
      )
    ORDER BY ta.due_at ASC NULLS LAST
    `,
    [userId]
  );

  return rows;
}