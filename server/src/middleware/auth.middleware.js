import { admin } from '../config/firebase.js';
import { getOrCreateUserByToken } from '../services/users.service.js';

export async function requireAuth(req, res, next) {
  try {
    // 1️⃣ Log what the server is receiving
    const header = req.headers.authorization || '';
    // console.log('🛰 Incoming Authorization header:', header || '(none)');

    // 2️⃣ Extract token
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      console.log('🚫 No token provided');
      return res.status(401).json({ message: 'Missing token' });
    }

    // 3️⃣ Verify token using Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(token);
    // console.log('✅ Token verified for:', decoded.email);

    // 4️⃣ Upsert user in DB (creates new user if first login)
    req.user = await getOrCreateUserByToken(decoded);

    // 5️⃣ Pass to next middleware / route
    next();

  } catch (e) {
    console.error('❌ Token verification failed:', e.message);
    res.status(401).json({ message: 'Invalid token' });
  }
}