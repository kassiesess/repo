import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// AI responses for common questions
const aiResponses = {
  'привет': 'Здравствуйте! Чем могу помочь с вашими займами?',
  'здравствуйте': 'Здравствуйте! Чем могу помочь с вашими займами?',
  'здравствуй': 'Здравствуйте! Чем могу помочь с вашими займами?',
  'help': 'Я могу помочь вам с информацией о займах, платежах и верификации.',
  'как создать займ?': 'Для создания займа: 1) Перейдите на вкладку "Создать займ", 2) Укажите сумму, ставку и срок, 3) Введите email заемщика, 4) Проверьте данные и создайте займ.',
  'как рассчитать проценты по займу?': 'Формула: Сумма × Ставка × (Срок / 12). Пример: 100 000 × 0.12 × 0.5 = 6 000 сом процентов за 6 месяцев.',
  'какие документы нужны для займа?': 'Для верификации: паспорт КР, ИНН, фото паспорта, селфи. Для оформления - только email заемщика.',
  'что делать при просрочке платежа?': '1) Свяжитесь с другой стороной, 2) Оплатите задолженность, 3) При необходимости сгенерируйте исковое заявление в приложении.',
  'максимальная процентная ставка в кр?': 'Законодательство КР не ограничивает максимальную ставку для займов между физлицами. Рекомендуем соблюдать разумные ставки.',
  'можно ли досрочно погасить займ?': 'Да! Заемщик может внести любую сумму досрочно. Проценты начисляются только за фактический период пользования.',
  'нужна ли верификация?': 'Да, верификация обязательна для создания займов. Это защищает обе стороны и придает договорам юридическую силу.'
};

// AI Chat endpoint
router.post('/ai', authMiddleware, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Get or create session
    let session;
    if (session_id) {
      session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?')
        .get(session_id, req.userId);
    }
    
    if (!session) {
      const sessionId = uuidv4();
      db.prepare('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)')
        .run(sessionId, req.userId);
      session = { id: sessionId };
    }
    
    // Save user message
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content)
      VALUES (?, ?, 'user', ?)
    `).run(uuidv4(), session.id, message);
    
    // Generate AI response
    const lowerMessage = message.toLowerCase().trim();
    let response = aiResponses[lowerMessage];
    
    if (!response) {
      response = `Я получил ваше сообщение: "${message}".\n\nВы можете спросить меня о:\n• Создании и управлении займами\n• Расчете процентов\n• Требованиях к документам\n• Действиях при просрочке\n• Юридических вопросах\n• Верификации`;
    }
    
    // Save assistant message
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content)
      VALUES (?, ?, 'assistant', ?)
    `).run(uuidv4(), session.id, response);
    
    res.json({ 
      data: { 
        reply: response,
        session_id: session.id
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// Get chat history
router.get('/history/:sessionId', authMiddleware, (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_date ASC
    `).all(req.params.sessionId);
    
    res.json({ data: { messages } });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get user's sessions
router.get('/sessions', authMiddleware, (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_date DESC
    `).all(req.userId);
    
    res.json({ data: sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Clear session
router.delete('/session/:sessionId', authMiddleware, (req, res) => {
  try {
    // Delete messages first
    db.prepare('DELETE FROM chat_messages WHERE session_id = ?')
      .run(req.params.sessionId);
    
    // Delete session
    db.prepare('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?')
      .run(req.params.sessionId, req.userId);
    
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

export default router;
