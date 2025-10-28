import app from './app.js';
import { env } from './config/env.js';
import { startEscalationCron } from './jobs/escalation.cron.js';

app.listen(env.port, () => {
  console.log(`API on http://localhost:${env.port}`);
  startEscalationCron();
});