import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const id = uuidv4();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    db.prepare(`
      INSERT INTO users (id, email, password, full_name, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, hashedPassword, full_name || null, phone || null);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    delete user.password;
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    
    res.status(201).json({ 
      user,
      token,
      data: { user, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    delete user.password;
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    
    res.json({ 
      user,
      token,
      data: { user, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    delete user.password;
    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update current user
router.put('/me', authMiddleware, (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'full_name', 'phone', 'address', 'passport_series', 'passport_number',
      'inn', 'birth_date', 'verification_status', 'passport_front_url',
      'passport_back_url', 'selfie_url', 'two_factor_enabled', 
      'biometric_enabled', 'notification_settings', 'language'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => {
      const val = updates[f];
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
    values.push(req.userId);
    
    db.prepare(`
      UPDATE users SET ${setClause}, updated_date = datetime('now')
      WHERE id = ?
    `).run(...values);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    delete user.password;
    
    res.json({ data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Logout (client-side token removal, server can blacklist if needed)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ data: { success: true } });
});

export default router;
