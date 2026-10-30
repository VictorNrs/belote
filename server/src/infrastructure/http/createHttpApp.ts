import express, { Express } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Sert le client React compilé (en production) et une route de santé. */
export function createHttpApp(clientDistPath: string): Express {
  const app = express();
  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  if (!existsSync(clientDistPath)) return app;
  app.use(express.static(clientDistPath));
  app.get('*', (_request, response) => response.sendFile(join(clientDistPath, 'index.html')));
  return app;
}
