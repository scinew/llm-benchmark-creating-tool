import { Router } from 'express';
import db from '../db/database';

const router = Router();

router.get('/health', (_req, res) => {
  try {
    const result = db.prepare('SELECT 1').get();
    res.json({
      status: 'ok',
      database: result ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
