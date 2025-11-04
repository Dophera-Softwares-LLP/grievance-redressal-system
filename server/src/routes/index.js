import { Router } from 'express';
import tickets from './tickets.routes.js';
import users from './users.routes.js';
import files from "./files.routes.js";

const r = Router();
r.use('/tickets', tickets);
r.use('/users', users);
r.use("/files", files);
export default r;