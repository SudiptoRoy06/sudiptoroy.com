import 'dotenv/config';
import { app } from './app.js';
import { closeDatabase, connectDatabase } from './config/database.js';
import { environment } from './config/environment.js';

export { app };

export async function startServer() {
  await connectDatabase();
  const server = app.listen(environment.port, () => console.log(`Server listening on ${environment.port}`));
  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    server.close(async () => { await closeDatabase(); process.exit(0); });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}
