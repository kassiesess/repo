import express from 'express';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password;
    delete user.passport_front_url;
    delete user.passport_back_url;
    delete user.selfie_url;
    
    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user by email
router.get('/email/:email', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.params.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password;
    delete user.passport_front_url;
    delete user.passport_back_url;
    delete user.selfie_url;
    
    res.json({ data: user });
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Search users
router.get('/search/:query', authMiddleware, (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    const users = db.prepare(`
      SELECT id, email, full_name, verification_status, created_date 
      FROM users 
      WHERE email LIKE ? OR full_name LIKE ?
      LIMIT 20
    `).all(searchQuery, searchQuery);
    
    res.json({ data: users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
