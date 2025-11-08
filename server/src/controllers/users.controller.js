// src/controllers/users.controller.js
import { query } from '../config/db.js';

export async function getProfile(req, res, next) {
  try {

    // Ensure we have the logged-in user's id (from auth middleware)
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1️⃣ Get the user's first role from user_roles + roles
    const { rows } = await query(
      `
      SELECT 
        u.id,
        u.uid,
        u.email,
        u.name,
        COALESCE(r.code, 'student') AS role
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Return enriched user profile
    res.json(rows[0]);

  } catch (e) {
    next(e);
  }
}