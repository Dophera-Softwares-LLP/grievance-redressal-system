import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getProfile } from '../controllers/users.controller.js';

const r = Router();

// ✅ GET /api/users/me → returns the authenticated user's info
r.get('/me', requireAuth, getProfile);

export default r;