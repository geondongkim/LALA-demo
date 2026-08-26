import express from 'express';
import path from 'node:path';
import { apiRouter } from './api-handler';

const app = express();
const requestedPort = Number.parseInt(process.env.PORT ?? '8080', 10);
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 8080;
const distPath = path.resolve(process.cwd(), 'dist', 'public');

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use('/api', apiRouter);
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`LALA-demo server listening on port ${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
