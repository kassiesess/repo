import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generic function invoker
router.post('/invoke', authMiddleware, async (req, res) => {
  try {
    const { function_name, params } = req.body;
    
    if (!function_name) {
      return res.status(400).json({ error: 'function_name required' });
    }
    
    // Route to appropriate handler
    switch (function_name) {
      case 'aiChat':
        return res.json(await aiChat(req.userId, params));
      case 'getChatHistory':
        return res.json(await getChatHistory(req.userId, params));
      case 'kycVerification':
        return res.json(await kycVerification(req.userId, params));
      case 'detectFraud':
        return res.json(await detectFraud(req.userId, params));
      case 'notifyLoanCreated':
        return res.json(await notifyLoanCreated(req.userId, params));
      case 'calculateCreditScore':
        return res.json(await calculateCreditScore(req.userId, params));
      case 'generateTaxReport':
        return res.json(await generateTaxReport(req.userId, params));
      case 'calculateLateFees':
        return res.json(await calculateLateFees(params));
      case 'checkOverdueLoans':
        return res.json(await checkOverdueLoans(params));
      case 'checkInsuranceEligibility':
        return res.json(await checkInsuranceEligibility(req.userId, params));
      case 'verifyDocument':
        return res.json(await verifyDocument(params));
      case 'generateLoanContract':
        return res.json(await generateLoanContract(params));
      case 'generateDigitalSignature':
        return res.json(await generateDigitalSignature(req.userId, params));
      case 'generateAnalyticsReport':
        return res.json(await generateAnalyticsReport(req.userId, params));
      case 'exportUserData':
        return res.json(await exportUserData(req.userId));
      case 'backupDatabase':
        return res.json(await backupDatabase());
      default:
        return res.status(404).json({ error: `Function ${function_name} not found` });
    }
  } catch (error) {
    console.error('Function invoke error:', error);
    res.status(500).json({ error: 'Function execution failed' });
  }
});

// Function implementations
async function aiChat(userId, params) {
  const { message, session_id } = params || {};
  
  // Same logic as chat route
  let session;
  if (session_id) {
    session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?')
      .get(session_id, userId);
  }
  
  if (!session) {
    const sessionId = uuidv4();
    db.prepare('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)')
      .run(sessionId, userId);
    session = { id: sessionId };
  }
  
  // Save user message
  db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, 'user', ?)
  `).run(uuidv4(), session.id, message);
  
  const responses = {
    'привет': 'Здравствуйте! Чем могу помочь?',
    'здравствуйте': 'Здравствуйте! Чем могу помочь?',
    'как создать займ?': 'Для создания займа перейдите в раздел "Создать займ" и заполните параметры.',
    'какие документы нужны?': 'Для верификации: паспорт, ИНН, фото паспорта, селфи.'
  };
  
  const response = responses[message?.toLowerCase()] || 
    `Вы написали: "${message}". Чем могу помочь?`;
  
  db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, 'assistant', ?)
  `).run(uuidv4(), session.id, response);
  
  return { data: { reply: response, session_id: session.id } };
}

async function getChatHistory(userId, params) {
  const { session_id } = params || {};
  
  if (!session_id) {
    return { data: { messages: [] } };
  }
  
  const messages = db.prepare(`
    SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_date ASC
  `).all(session_id);
  
  return { data: { messages } };
}

async function kycVerification(userId, params) {
  // Simulate KYC verification
  const isApproved = Math.random() > 0.1;
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (isApproved) {
    db.prepare(`
      UPDATE users SET verification_status = 'approved', updated_date = datetime('now')
      WHERE id = ?
    `).run(userId);
  } else {
    db.prepare(`
      UPDATE users SET verification_status = 'rejected', updated_date = datetime('now')
      WHERE id = ?
    `).run(userId);
  }
  
  return {
    data: {
      verified: isApproved,
      status: isApproved ? 'approved' : 'rejected',
      passport: {
        data: {
          full_name: user?.full_name || '',
          series: user?.passport_series || '',
          number: user?.passport_number || '',
          inn: user?.inn || ''
        },
        issues: isApproved ? [] : ['Document verification failed']
      }
    }
  };
}

async function detectFraud(userId, params) {
  // Simple fraud check - always low risk
  return {
    data: {
      risk_score: Math.random() * 0.2,
      is_suspicious: false,
      warnings: []
    }
  };
}

async function notifyLoanCreated(userId, params) {
  const { loan_id, borrower_email } = params || {};
  
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link)
    VALUES (?, ?, 'loan_created', 'Займ создан', 'Ваш займ успешно создан', '/loans?id=' || ?)
  `).run(uuidv4(), userId, loan_id);
  
  return { data: { success: true } };
}

async function calculateCreditScore(userId, params) {
  const loans = db.prepare(`
    SELECT * FROM loans WHERE lender_id = ? OR borrower_id = ?
  `).all(userId, userId);
  
  const totalLoans = loans.length;
  const paidLoans = loans.filter(l => l.status === 'paid').length;
  const overdueLoans = loans.filter(l => l.status === 'overdue').length;
  const score = Math.min(850, 300 + (totalLoans * 50) + (paidLoans * 30));
  
  return {
    data: {
      score,
      grade: score >= 750 ? 'A' : score >= 650 ? 'B' : score >= 550 ? 'C' : 'D',
      factors: {
        payment_history: paidLoans > 0 ? 'good' : 'no_history',
        total_loans: totalLoans,
        paid_loans: paidLoans,
        overdue_loans: overdueLoans
      }
    }
  };
}

async function generateTaxReport(userId, params) {
  const { year } = params || {};
  const targetYear = parseInt(year) || new Date().getFullYear();
  
  const payments = db.prepare(`
    SELECT p.*, l.lender_id FROM payments p
    JOIN loans l ON p.loan_id = l.id
    WHERE l.lender_id = ? AND strftime('%Y', p.paid_date) = ?
  `).all(userId, targetYear.toString());
  
  const totalInterest = payments.reduce((sum, p) => sum + (p.interest_amount || 0), 0);
  
  return {
    data: {
      year: targetYear,
      user_id: userId,
      total_payments: payments.length,
      total_interest: totalInterest,
      report_date: new Date().toISOString()
    }
  };
}

async function calculateLateFees(params) {
  const { loan_id } = params || {};
  
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loan_id);
  
  if (!loan) {
    return { data: { error: 'Loan not found' } };
  }
  
  const now = new Date();
  const dueDate = new Date(loan.end_date);
  const daysLate = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));
  
  if (daysLate === 0) {
    return { data: { days_late: 0, late_fee: 0 } };
  }
  
  const dailyRate = 0.001;
  const lateFee = loan.amount * dailyRate * daysLate;
  
  return {
    data: {
      days_late: daysLate,
      late_fee: Math.min(lateFee, loan.amount * 0.3)
    }
  };
}

async function checkOverdueLoans(params) {
  const { userId } = params || {};
  
  const loans = db.prepare(`
    SELECT * FROM loans 
    WHERE (lender_id = ? OR borrower_id = ?) AND status = 'active'
  `).all(userId, userId);
  
  const now = new Date();
  const overdueLoans = loans.filter(l => new Date(l.end_date) < now);
  
  return { data: { loans: overdueLoans, count: overdueLoans.length } };
}

async function checkInsuranceEligibility(userId, params) {
  const { loanId } = params || {};
  
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
  
  if (!loan) {
    return { data: { eligible: false, reason: 'Loan not found' } };
  }
  
  const isEligible = loan.status === 'active' && new Date(loan.end_date) > new Date();
  
  return {
    data: {
      eligible: isEligible,
      reason: isEligible ? 'Loan is active and within term' : 'Does not meet criteria'
    }
  };
}

async function verifyDocument(params) {
  // Simulate document verification
  return { data: { verified: true, details: 'Document verified' } };
}

async function generateLoanContract(params) {
  const { loanId } = params || {};
  
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
  
  if (!loan) {
    return { data: { error: 'Loan not found' } };
  }
  
  return {
    data: {
      contract_url: `/api/loans/${loanId}/contract`,
      contract_id: `CONTRACT-${loanId.substring(0, 8).toUpperCase()}`
    }
  };
}

async function generateDigitalSignature(userId, params) {
  const signature = `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  return { data: { signature, verified: true } };
}

async function generateAnalyticsReport(userId, params) {
  const { startDate, endDate } = params || {};
  
  const loans = db.prepare(`
    SELECT * FROM loans WHERE lender_id = ? OR borrower_id = ?
  `).all(userId, userId);
  
  const payments = db.prepare(`
    SELECT p.* FROM payments p
    JOIN loans l ON p.loan_id = l.id
    WHERE l.lender_id = ? OR l.borrower_id = ?
  `).all(userId, userId);
  
  return {
    data: {
      total_loans: loans.length,
      active_loans: loans.filter(l => l.status === 'active').length,
      total_payments: payments.length,
      total_amount_paid: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      report_period: { start: startDate, end: endDate }
    }
  };
}

async function exportUserData(userId) {
  const loans = db.prepare(`
    SELECT * FROM loans WHERE lender_id = ? OR borrower_id = ?
  `).all(userId, userId);
  
  const payments = db.prepare(`
    SELECT p.* FROM payments p
    JOIN loans l ON p.loan_id = l.id
    WHERE l.lender_id = ? OR l.borrower_id = ?
  `).all(userId, userId);
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  delete user.password;
  
  const userData = {
    user,
    loans,
    payments,
    export_date: new Date().toISOString()
  };
  
  return {
    data: {
      download_url: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(userData, null, 2))}`,
      filename: `user_data_${userId.substring(0, 8)}.json`
    }
  };
}

async function backupDatabase() {
  const backup = {
    loans: db.prepare('SELECT * FROM loans').all(),
    payments: db.prepare('SELECT * FROM payments').all(),
    users: db.prepare('SELECT * FROM users').all(),
    notifications: db.prepare('SELECT * FROM notifications').all(),
    backup_date: new Date().toISOString()
  };
  
  return {
    data: {
      backup_id: uuidv4(),
      download_url: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`,
      size_bytes: new Blob([JSON.stringify(backup)]).size
    }
  };
}

export default router;
