import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get payments for a loan
router.get('/loan/:loanId', authMiddleware, (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT * FROM payments WHERE loan_id = ? ORDER BY due_date ASC
    `).all(req.params.loanId);
    
    res.json({ data: payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// Create payment
router.post('/', authMiddleware, (req, res) => {
  try {
    const { loan_id, amount, payment_date } = req.body;
    
    if (!loan_id || !amount) {
      return res.status(400).json({ error: 'loan_id and amount required' });
    }
    
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loan_id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO payments (id, loan_id, user_id, amount, paid_date, status)
      VALUES (?, ?, ?, ?, ?, 'paid')
    `).run(id, loan_id, req.userId, amount, payment_date || new Date().toISOString().split('T')[0]);
    
    // Update loan amount_paid
    const newAmountPaid = (loan.amount_paid || 0) + parseFloat(amount);
    const isCompleted = newAmountPaid >= loan.total_repayment;
    
    db.prepare(`
      UPDATE loans SET amount_paid = ?, status = ?, updated_date = datetime('now')
      WHERE id = ?
    `).run(newAmountPaid, isCompleted ? 'completed' : 'active', loan_id);
    
    // Get updated loan
    const updatedLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loan_id);
    
    // Update payment records if overdue
    const payments = db.prepare(`
      SELECT * FROM payments WHERE loan_id = ? AND status = 'scheduled' ORDER BY due_date ASC
    `).all(loan_id);
    
    let remaining = parseFloat(amount);
    for (const payment of payments) {
      if (remaining >= payment.amount) {
        db.prepare(`
          UPDATE payments SET status = 'paid', paid_date = ? WHERE id = ?
        `).run(payment_date || new Date().toISOString().split('T')[0], payment.id);
        remaining -= payment.amount;
      } else {
        break;
      }
    }
    
    res.status(201).json({ 
      data: {
        payment_id: id,
        loan: updatedLoan
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment status
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { status, paid_date } = req.body;
    
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    db.prepare(`
      UPDATE payments SET status = ?, paid_date = ? WHERE id = ?
    `).run(status, paid_date, req.params.id);
    
    const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
    
    res.json({ data: updated });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

export default router;
