import { env } from '../config/env.js';

export function computeDueAt(hours = env.defaultSlaHours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

// For MVP, return null (unassigned) or student mentor etc.
// In real impl, look up mentor_id or role mapping from DB.
export async function pickInitialAssignee(studentUser, categoryName) {
  // Example: if Academic → mentor_id; else keep null for triage by council
  if (categoryName === 'Academic' && studentUser.mentor_id) return studentUser.mentor_id;
  return null; // council bucket (unassigned)
}