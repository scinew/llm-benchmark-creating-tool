import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import healthRouter from './routes/health';
import usersRouter from './routes/users';

const rootDir = path.join(__dirname, '../../..');
dotenv.config({ path: path.join(rootDir, '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

const exportsDir = path.join(rootDir, 'server/exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', healthRouter);
app.use('/api', usersRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'Backend API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized and migrations applied`);
  console.log(`📁 Exports directory: ${exportsDir}`);
});
