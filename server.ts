import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './api-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/api', apiRouter);

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LALA-demo server running on http://0.0.0.0:${PORT}`);
});
