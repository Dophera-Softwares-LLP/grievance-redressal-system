import { query } from '../config/db.js';

export async function createTicket({ title, description, categoryId, studentId, assigneeId, attachmentUrl, dueAt }) {
  const { rows } = await query(
    `INSERT INTO tickets (title, description, category_id, student_id, current_assignee_id, attachment_url, due_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [title, description, categoryId, studentId, assigneeId, attachmentUrl, dueAt]
  );
  return rows[0];
}

export async function getMyTickets(studentId, status) {
  const sql = status ? 
    'SELECT * FROM tickets WHERE student_id=$1 AND status=$2 ORDER BY updated_at DESC' :
    'SELECT * FROM tickets WHERE student_id=$1 ORDER BY updated_at DESC';
  const { rows } = await query(sql, status ? [studentId, status] : [studentId]);
  return rows;
}

export async function getAssignedTickets(userId) {
  const { rows } = await query(
    'SELECT * FROM tickets WHERE current_assignee_id=$1 AND status != $2 ORDER BY due_at ASC NULLS LAST',
    [userId, 'resolved']
  );
  return rows;
}