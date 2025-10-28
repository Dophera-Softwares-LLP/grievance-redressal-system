import 'dotenv/config';

export const env = {
  port: process.env.PORT || 4000,
  dbUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  defaultSlaHours: parseInt(process.env.DEFAULT_SLA_HOURS || '48', 10),
  escalationCron: process.env.ESCALATION_SCAN_CRON || '*/10 * * * *'
};