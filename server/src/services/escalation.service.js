import { query } from '../config/db.js';
import { env } from '../config/env.js';

export function computeDueAt(hours = env.defaultSlaHours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

// Helper: get role ID by code
async function roleId(code) {
  const { rows } = await query(`SELECT id FROM roles WHERE code=$1`, [code]);
  if (!rows[0]) throw new Error(`Role not found: ${code}`);
  return rows[0].id;
}

// Helper: get mentor user_id for a student
async function getMentorIdForStudent(studentId) {
  const { rows } = await query(
    `SELECT mentor_id FROM mentorship WHERE student_id=$1`,
    [studentId]
  );
  return rows[0]?.mentor_id || null;
}

/**
 * Decide first assignee based on category:
 * - Academic → Mentor (user), role = mentor
 * - Hostel → Warden (role)
 * - Mess → Mess Incharge (role)
 * - Laundry → Laundry Incharge (role)
 * - Harassment / POSH → POSH Committee (role)
 * - Disciplinary → Disciplinary Committee (role)
 * - Transport → Transport Incharge (role)
 * - Student Affairs → Council (role)
 * - Default → Council (role)
 */
export async function pickInitialAssignee(studentUser, categoryName) {
  const studentId = studentUser.id;
  const cat = (categoryName || '').trim().toLowerCase();

  if (cat === 'academic') {
    const rId = await roleId('mentor');
    const mentorId = await getMentorIdForStudent(studentId);
    return { roleId: rId, userId: mentorId || null }; // fallback to role-only
  }

  if (cat === 'hostel')            return { roleId: await roleId('warden'),               userId: null };
  if (cat === 'mess')              return { roleId: await roleId('mess_incharge'),        userId: null };
  if (cat === 'laundry')           return { roleId: await roleId('laundry_incharge'),     userId: null };
  if (cat === 'harassment' || cat === 'posh')
                                   return { roleId: await roleId('posh_committee'),       userId: null };
  if (cat === 'disciplinary')      return { roleId: await roleId('disciplinary_committee'), userId: null };
  if (cat === 'transport')         return { roleId: await roleId('transport_incharge'),   userId: null };
  if (cat === 'student affairs')   return { roleId: await roleId('council'),              userId: null };

  // Default: Student Council triage
  return { roleId: await roleId('council'), userId: null };
}