import cron from 'node-cron';
import { env } from '../config/env.js';

export function startEscalationCron() {
  cron.schedule(env.escalationCron, async () => {
    // 1) find overdue tickets
    // 2) compute next assignee by category + current level
    // 3) update ticket current_assignee_id + due_at
    // Keep it simple for MVP, refine later.
    console.log('[cron] escalate overdue tickets...');
  });
}