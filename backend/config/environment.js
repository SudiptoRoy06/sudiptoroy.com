const sessionMinutes = Number(process.env.SESSION_TTL_MINUTES || 60);

export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3001),
  session: {
    cookieName: 'sr_session',
    ttlMs: sessionMinutes * 60_000
  }
};
