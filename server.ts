import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const app = createApp();
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Semeadores de Fogo Global] Servidor rodando em http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
