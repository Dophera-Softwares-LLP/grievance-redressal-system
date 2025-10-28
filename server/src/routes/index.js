import { Router } from 'express';
import tickets from './tickets.routes.js';
import users from './users.routes.js';

const r = Router();
r.use('/tickets', tickets);
r.use('/users', users);
export default r;