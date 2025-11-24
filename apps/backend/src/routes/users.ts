import { Router } from 'express';
import db from '../db/database';

const router = Router();

router.get('/users', (_req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const insert = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)');
    const result = insert.run(email, name);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
