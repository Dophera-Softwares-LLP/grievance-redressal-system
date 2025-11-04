// server/src/routes/files.routes.js
import { Router } from "express";
import crypto from "crypto";
import { getPresignedPut } from "../config/spaces.js";
import { requireAuth } from "../middleware/auth.middleware.js"; // must exist or stub it for now

const router = Router();

/**
 * POST /api/files/sign
 * Body: { filename, contentType }
 * Response: { uploadUrl, fileUrl, key }
 */
router.post("/sign", requireAuth, async (req, res, next) => {
  try {
    const { filename, contentType } = req.body || {};
    if (!filename || !contentType)
      return res.status(400).json({ message: "filename & contentType required" });

    // make a unique, safe key inside “tickets/<uid>/…”
    const ext = filename.includes(".")
      ? filename.split(".").pop().toLowerCase()
      : "bin";
    const random = crypto.randomBytes(4).toString("hex");
    const ts = Date.now();

    // up to 10 photos + 1 video allowed later, so folder-per-ticket is neat
    const key = `tickets/${req.user?.id || "anon"}/${ts}-${random}.${ext}`;

    const { uploadUrl, fileUrl } = await getPresignedPut({ key, contentType });
    res.json({ uploadUrl, fileUrl, key });
  } catch (err) {
    console.error("Sign route error:", err);
    next(err);
  }
});

export default router;