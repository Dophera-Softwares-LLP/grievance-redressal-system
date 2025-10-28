import { admin } from '../config/firebase.js';
import { getOrCreateUserByToken } from '../services/users.service.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const decoded = await admin.auth().verifyIdToken(token);
    // upsert user in our DB, default role = student
    req.user = await getOrCreateUserByToken(decoded);
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
}