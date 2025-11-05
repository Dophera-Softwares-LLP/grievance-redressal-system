import * as tickets from '../services/tickets.service.js';

export async function postTicket(req, res, next) {
  try {
    const user = req.user;
    const payload = req.body;

    // ✅ Expect payload: { title, description, categoryName?, attachments?: string[] }
    // e.g. attachments: ["https://space...1.png", "https://space...2.pdf"]

    // Optional: sanitize attachments to ensure it’s always an array
    if (payload.attachments && !Array.isArray(payload.attachments)) {
      payload.attachments = [payload.attachments];
    }

    const ticket = await tickets.createTicketForStudent(user, payload);
    res.status(201).json(ticket);
  } catch (e) {
    next(e);
  }
}

export async function getMy(req, res, next) {
  try {
    const data = await tickets.listMyTickets(req.user, req.query.status);
    res.json(data);
  } catch (e) { next(e); }
}

export async function getAssigned(req, res, next) {
  try {
    const data = await tickets.listAssignedToMe(req.user);
    res.json(data);
  } catch (e) { next(e); }
}