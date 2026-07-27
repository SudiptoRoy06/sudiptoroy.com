import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { environment } from './config/environment.js';
import { frontendDist, uploadDir } from './config/paths.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny' }));
app.use('/api', apiRouter);

if (environment.isProduction) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => (
    req.method === 'GET' && !req.path.startsWith('/api/')
      ? res.sendFile(path.join(frontendDist, 'index.html'))
      : next()
  ));
}

app.use(notFound);
app.use(errorHandler);
