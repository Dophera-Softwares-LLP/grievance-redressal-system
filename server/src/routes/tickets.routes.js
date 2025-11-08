import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import { postTicket, getMy, getAssigned } from '../controllers/tickets.controller.js';
import {
  commentOnTicket,
  resolveTicket,
  escalateTicket,
  getAllByAuthority
} from '../controllers/tickets.controller.js';
import * as ticketsService from '../services/tickets.service.js';

const r = Router();

r.post('/', requireAuth, postTicket);                          // student creates
r.get('/',  requireAuth, getMy);                               // student list
r.get(
  '/assigned',
  requireAuth,
  requireRole(
    ROLES.MENTOR,
    ROLES.WARDEN,
    ROLES.CHIEF_WARDEN,
    ROLES.COORDINATOR,
    ROLES.DEAN,
    ROLES.VC,
    ROLES.COUNCIL
  ),
  getAssigned
);
r.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await ticketsService.findByIdWithRelations(id, userId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found or unauthorized" });

    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

// 💬 Add comment (with optional attachments)
r.put('/:id/comment', requireAuth, commentOnTicket);

// ✅ Resolve ticket (with comment & attachments)
r.put('/:id/resolve', requireAuth, resolveTicket);

// 🔺 Escalate ticket (with reason & attachments)
r.put('/:id/escalate', requireAuth, escalateTicket);

// 📋 Authority: fetch all tickets (resolved, escalated, pending)
r.get('/assigned/all', requireAuth, getAllByAuthority);

export default r;