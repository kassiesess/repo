import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, (req, res) => {
  try {
    const { limit = 50, unread_only } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.userId];
    
    if (unread_only === 'true') {
      query += ' AND read = 0';
    }
    
    query += ' ORDER BY created_date DESC LIMIT ?';
    params.push(parseInt(limit) || 50);
    
    const notifications = db.prepare(query).all(...params);
    
    // Get unread count
    const unreadCount = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    ).get(req.userId);
    
    res.json({ 
      data: notifications,
      unread_count: unreadCount.count
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);
    
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?')
      .run(req.userId);
    
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);
    
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
