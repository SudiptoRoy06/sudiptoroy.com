const sessionMinutes = Number(process.env.SESSION_TTL_MINUTES || 60);
const frontendOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3001),
  frontendOrigins,
  session: {
    cookieName: 'sr_session',
    ttlMs: sessionMinutes * 60_000
  }
};
