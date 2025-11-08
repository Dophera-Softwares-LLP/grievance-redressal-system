import { query } from '../config/db.js';

export function requireRole(...allowed) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // 1️⃣ Fetch all roles for this user from DB
      const { rows } = await query(
        `
        SELECT r.code
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
        `,
        [req.user.id]
      );

      const userRoles = rows.map(r => r.code);

      // 2️⃣ Check if any of them matches the allowed roles
      const hasAccess = !allowed.length || userRoles.some(r => allowed.includes(r));
      if (!hasAccess) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // 3️⃣ Attach the roles to req.user for later routes
      req.user.roles = userRoles;

      next();
    } catch (err) {
      console.error('Error in requireRole:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}