import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true }));

app.use('/api', routes);
app.use(errorHandler);

export default app;