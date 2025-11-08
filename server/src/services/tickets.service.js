import { pool } from '../config/db.js';
import { getCategoryIdByName } from '../data/categories.repo.js';
import {
  insertTicket,
  insertAssignment,
  insertAttachments,
  getMyTickets,
  getAssignedTickets
} from '../data/tickets.repo.js';

import { pickInitialAssignee, computeDueAt } from './escalation.service.js';

export async function createTicketForStudent(user, payload) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1️⃣ Resolve category id (if any)
    const categoryId = payload.categoryName
      ? await getCategoryIdByName(payload.categoryName)
      : null;

    // 2️⃣ Compute first assignee (role + optional user)
    const { roleId, userId } = await pickInitialAssignee(user, payload.categoryName);

    // 3️⃣ Compute due date
    const dueAt = computeDueAt();

    // 4️⃣ Insert ticket
    const { rows: tRows } = await client.query(
      `INSERT INTO tickets (title, description, category_id, student_id, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'open',NOW(),NOW())
       RETURNING *`,
      [payload.title, payload.description, categoryId, user.id]
    );
    const ticket = tRows[0];

    // 5️⃣ Insert initial assignment
    await client.query(
      `INSERT INTO ticket_assignments (ticket_id, role_id, user_id, action, due_at, started_at, is_current)
       VALUES ($1,$2,$3,'assign',$4,NOW(),true)`,
      [ticket.id, roleId, userId, dueAt]
    );

    // 6️⃣ Insert attachments (if any)
    const urls = Array.isArray(payload.attachments) ? payload.attachments : [];
    if (urls.length) {
      const params = [];
      const values = [];
      let idx = 1;
      for (const url of urls) {
        params.push(ticket.id, user.id, url);
        values.push(`($${idx++}, $${idx++}, $${idx++}, 'ticket')`);
      }
      await client.query(
        `INSERT INTO attachments (ticket_id, uploaded_by, url, kind)
         VALUES ${values.join(',')}`,
        params
      );
    }

    await client.query('COMMIT');
    return ticket;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listMyTickets(user, status) {
  return await getMyTickets(user.id, status);
}

export async function listAssignedToMe(user) {
  return await getAssignedTickets(user.id);
}

export async function findByIdWithRelations(ticketId, userId) {
  const result = await pool.query(
    `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.created_at,
      t.updated_at,
      t.resolved_at,
      c.name AS "categoryName",
      u.name AS "studentName",
      a.name AS "assigneeName",
      ta.due_at,
      ta.role_id AS "assigneeRoleId",
      t.student_id AS "studentId"
    FROM tickets t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.student_id = u.id
    LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.is_current = true
    LEFT JOIN users a ON ta.user_id = a.id
    WHERE t.id = $1
    `,
    [ticketId]
  );

  const ticket = result.rows[0];
  if (!ticket) return null;

  // 2️⃣ Authorization logic
  if (ticket.studentId === userId) {
    // ✅ Student who created the ticket can view
    return ticket;
  }

  // 3️⃣ Check if user is directly assigned
  const directCheck = await pool.query(
    `SELECT 1 FROM ticket_assignments WHERE ticket_id=$1 AND user_id=$2 AND is_current=true`,
    [ticketId, userId]
  );
  if (directCheck.rowCount) return ticket;

  // 4️⃣ Check if user has a shared-view role for this ticket
  const sharedCheck = await pool.query(
    `
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1
      AND ur.role_id = $2
      AND r.code IN (
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
    `,
    [userId, ticket.assigneeRoleId]
  );

  if (sharedCheck.rowCount) return ticket;

  // ❌ If none matched, deny access
  return null;
}