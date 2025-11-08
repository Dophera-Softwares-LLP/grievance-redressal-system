import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import usersRoutes from './routes/users.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true }));

app.use('/api', routes);
app.use('/api/users', usersRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use(errorHandler);

export default app;