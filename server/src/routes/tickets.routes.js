import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { ROLES } from '../config/roles.js';
import { postTicket, getMy, getAssigned } from '../controllers/tickets.controller.js';

const r = Router();

r.post('/', requireAuth, postTicket);                          // student creates
r.get('/',  requireAuth, getMy);                               // student list
r.get('/assigned', requireAuth, requireRole(
  ROLES.MENTOR, ROLES.WARDEN, ROLES.CHIEF_WARDEN, ROLES.COORDINATOR, ROLES.DEAN, ROLES.VC, ROLES.COUNCIL
), getAssigned);

// add: PUT /:id/resolve, /:id/escalate, /:id/transfer, /:id/extend-deadline

export default r;