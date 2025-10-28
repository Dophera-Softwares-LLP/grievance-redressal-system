// src/controllers/users.controller.js
export async function getProfile(req, res, next) {
  try {
    res.json(req.user);
  } catch (e) {
    next(e);
  }
}