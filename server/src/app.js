import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct rate-limit IPs
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // allow same-origin/curl (no Origin header) and configured frontends
        if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
    })
  );
  app.use(express.json({ limit: '20kb' }));
  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
