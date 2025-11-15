import { pool,query  } from '../config/db.js';
import { getCategoryIdByName } from '../data/categories.repo.js';
import {
  insertTicket,
  insertAssignment,
  insertAttachments,
  getMyTickets,
  getAssignedTickets
} from '../data/tickets.repo.js';
import { ESCALATION } from '../config/escalation-map.js';
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

      -- latest assignment (not only current)
      last_a.name AS "assigneeName",
      last_ta.due_at,
      last_ta.role_id AS "assigneeRoleId",

      t.student_id AS "studentId"
    FROM tickets t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.student_id = u.id

    -- 👇 NEW: latest assignment, even if resolved or old
    LEFT JOIN LATERAL (
      SELECT ta.*
      FROM ticket_assignments ta
      WHERE ta.ticket_id = t.id
      ORDER BY ta.started_at DESC
      LIMIT 1
    ) AS last_ta ON TRUE

    -- 👇 NEW: latest assignee user
    LEFT JOIN users last_a ON last_ta.user_id = last_a.id

    WHERE t.id = $1
    `,
    [ticketId]
  );

  const ticket = result.rows[0];
  if (!ticket) return null;
  
  const attachmentsRes = await pool.query(
    `
    SELECT id, url, kind, uploaded_by, created_at
    FROM attachments
    WHERE ticket_id = $1
    ORDER BY created_at ASC
    `,
    [ticketId]
  );
  ticket.attachments = attachmentsRes.rows;


  // 2️⃣ Authorization logic
  if (ticket.studentId === userId) {
    // ✅ Student who created the ticket can view
    return ticket;
  }

  // 3️⃣ Check if user is directly assigned
  const directCheck = await pool.query(
    `SELECT 1 FROM ticket_assignments WHERE ticket_id = $1 AND user_id = $2 LIMIT 1`,
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

export async function commentOnTicket(user, ticketId, payload) {
  const { comment, attachments = [] } = payload;

  await query('BEGIN');
  try {
    if (comment) {
      await query(
        `INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES ($1, $2, $3)`,
        [ticketId, user.id, comment]
      );
    }
    for (const url of attachments) {
      await query(
        `INSERT INTO attachments (ticket_id, uploaded_by, url, kind)
         VALUES ($1, $2, $3, 'comment')`,
        [ticketId, user.id, url]
      );
    }
    await query('COMMIT');
  } catch (e) {
    await query('ROLLBACK');
    throw e;
  }

  return { success: true };
}

export async function resolveTicket(user, ticketId, payload) {
  const { comment, attachments = [] } = payload;

  await query('BEGIN');
  try {
    // Add comment before resolving
    await commentOnTicket(user, ticketId, { comment, attachments });

    // Mark as resolved
    await query(`UPDATE tickets SET status='resolved', resolved_at=NOW(), updated_at=NOW() WHERE id=$1`, [ticketId]);
    await query(`UPDATE ticket_assignments SET is_current=false, ended_at=NOW() WHERE ticket_id=$1 AND is_current=true`, [ticketId]);

    await query('COMMIT');
  } catch (e) {
    await query('ROLLBACK');
    throw e;
  }
  return { message: 'Ticket resolved successfully' };
}



export async function escalateTicket(user, ticketId, payload) {
  const { comment, attachments = [] } = payload;

  const { rows: ticketRows } = await query('SELECT * FROM tickets WHERE id=$1', [ticketId]);
  const ticket = ticketRows[0];
  if (!ticket) throw new Error('Ticket not found');

  // Add comment before escalation
  await commentOnTicket(user, ticketId, { comment, attachments });

  // Determine next role via category
  const { rows: catRows } = await query('SELECT name FROM categories WHERE id=$1', [ticket.category_id]);
  const categoryName = catRows[0]?.name;
  const chain = ESCALATION[categoryName] || [];

  const { rows: current } = await query(
    'SELECT * FROM ticket_assignments WHERE ticket_id=$1 AND is_current=true AND user_id=$2',
    [ticketId, user.id]
  );
  if (!current.length) throw new Error('Not current assignee');

  const currentRole = current[0].role_id;

  // map role IDs -> codes (simplified assumption)
  const { rows: roles } = await query('SELECT * FROM roles ORDER BY id');
  const map = Object.fromEntries(roles.map(r => [r.id, r.code]));
  const reverse = Object.fromEntries(roles.map(r => [r.code, r.id]));

  const nextRoleCode = chain[chain.indexOf(map[currentRole]) + 1];
  if (!nextRoleCode) throw new Error('No higher authority to escalate to');

  const nextRoleId = reverse[nextRoleCode];

  await query('BEGIN');
  try {
    await query(`UPDATE ticket_assignments SET is_current=false, ended_at=NOW() WHERE ticket_id=$1 AND is_current=true`, [ticketId]);
    await query(
      `INSERT INTO ticket_assignments (ticket_id, role_id, action, due_at, started_at, is_current)
       VALUES ($1,$2,'escalate',$3,NOW(),true)`,
      [ticketId, nextRoleId, computeDueAt()]
    );
    await query(`UPDATE tickets SET status='in_progress', updated_at=NOW() WHERE id=$1`, [ticketId]);
    await query('COMMIT');
  } catch (e) {
    await query('ROLLBACK');
    throw e;
  }

  return { message: 'Ticket escalated successfully' };
}

// 🧩 list all tickets ever assigned to the authority
export async function listAllByAuthority(user) {
  const { rows } = await query(`
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
    JOIN ticket_assignments ta ON ta.ticket_id = t.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users s ON t.student_id = s.id
    WHERE ta.user_id = $1
    ORDER BY t.updated_at DESC
  `, [user.id]);
  
  return rows;
}
