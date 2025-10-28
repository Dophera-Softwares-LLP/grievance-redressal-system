import { createTicket, getMyTickets, getAssignedTickets } from '../data/tickets.repo.js';
import { getCategoryIdByName } from '../data/categories.repo.js';
import { pickInitialAssignee, computeDueAt } from './escalation.service.js';

export async function createTicketForStudent(user, payload) {
  const categoryId = payload.categoryName ? await getCategoryIdByName(payload.categoryName) : null;
  const assigneeId = await pickInitialAssignee(user, payload.categoryName);
  const dueAt = computeDueAt();
  return await createTicket({
    title: payload.title,
    description: payload.description,
    categoryId,
    studentId: user.id,
    assigneeId,
    attachmentUrl: payload.attachmentUrl || null,
    dueAt
  });
}

export async function listMyTickets(user, status) {
  return await getMyTickets(user.id, status);
}

export async function listAssignedToMe(user) {
  return await getAssignedTickets(user.id);
}
