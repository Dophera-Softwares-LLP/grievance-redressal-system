import * as tickets from '../services/tickets.service.js';

export async function postTicket(req, res, next) {
  try {
    const created = await tickets.createTicketForStudent(req.user, req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
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