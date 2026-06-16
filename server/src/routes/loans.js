import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all loans (with optional filters)
router.get('/', authMiddleware, (req, res) => {
  try {
    let { status, sort = '-created_date', limit = 100 } = req.query;
    
    let query = 'SELECT * FROM loans';
    const params = [];
    const conditions = [];
    
    // Filter by status
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    // For authenticated users, filter their loans
    if (req.userId) {
      conditions.push('(lender_id = ? OR borrower_id = ? OR borrower_email = ?)');
      params.push(req.userId, req.userId, req.userId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Sort
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? 'DESC' : 'ASC';
    const validFields = ['created_date', 'amount', 'interest_rate', 'status', 'end_date'];
    const safeSortField = validFields.includes(sortField) ? sortField : 'created_date';
    query += ` ORDER BY ${safeSortField} ${sortDir}`;
    
    // Limit
    const safeLimit = Math.min(parseInt(limit) || 100, 500);
    query += ' LIMIT ?';
    params.push(safeLimit);
    
    const loans = db.prepare(query).all(...params);
    
    // Parse JSON fields
    const parsedLoans = loans.map(loan => ({
      ...loan,
      payment_receipts: JSON.parse(loan.payment_receipts || '[]')
    }));
    
    res.json({ data: parsedLoans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to get loans' });
  }
});

// Get single loan
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Parse JSON fields
    loan.payment_receipts = JSON.parse(loan.payment_receipts || '[]');
    
    res.json({ data: loan });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: 'Failed to get loan' });
  }
});

// Create loan
router.post('/', authMiddleware, (req, res) => {
  try {
    const {
      borrower_email, amount, interest_rate, term_months, notes, monthly_payments,
      total_interest, tax_amount, total_repayment, monthly_payment,
      start_date, end_date
    } = req.body;
    
    if (!amount || !req.userId) {
      return res.status(400).json({ error: 'Amount and user authentication required' });
    }
    
    const lender = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO loans (
        id, lender_id, lender_name, lender_passport, borrower_email,
        amount, interest_rate, term_months, notes, monthly_payments,
        total_interest, tax_amount, total_repayment, monthly_payment,
        start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      id, req.userId, lender.full_name, 
      `${lender.passport_series || ''} ${lender.passport_number || ''}`.trim(),
      borrower_email, amount, interest_rate || 0, term_months || 1, 
      notes || null, monthly_payments ? 1 : 0,
      total_interest || 0, tax_amount || 0, total_repayment || amount,
      monthly_payment || amount, start_date || new Date().toISOString().split('T')[0],
      end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
    loan.payment_receipts = JSON.parse(loan.payment_receipts || '[]');
    
    // Create notification for lender
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link)
      VALUES (?, ?, 'loan_created', 'Займ создан', 'Ваш займ успешно создан', '/loans?id=' || ?)
    `).run(uuidv4(), req.userId, id);
    
    res.status(201).json({ data: loan });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

// Update loan
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const updates = req.body;
    const loanId = req.params.id;
    
    // Check ownership
    const existingLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    if (!existingLoan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const allowedFields = [
      'borrower_id', 'borrower_name', 'borrower_passport',
      'status', 'amount_paid', 'contract_signed_lender',
      'contract_signed_borrower', 'payment_receipts', 'notes'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    let values = fields.map(f => {
      const val = updates[f];
      if (f === 'payment_receipts') return JSON.stringify(val);
      if (typeof val === 'boolean') return val ? 1 : 0;
      return val;
    });
    values.push(loanId);
    
    db.prepare(`
      UPDATE loans SET ${setClause}, updated_date = datetime('now')
      WHERE id = ?
    `).run(...values);
    
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    loan.payment_receipts = JSON.parse(loan.payment_receipts || '[]');
    
    res.json({ data: loan });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ error: 'Failed to update loan' });
  }
});

// Delete loan
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const loanId = req.params.id;
    
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Only allow deletion of pending loans by owner
    if (loan.status !== 'pending' || loan.lender_id !== req.userId) {
      return res.status(403).json({ error: 'Cannot delete this loan' });
    }
    
    db.prepare('DELETE FROM loans WHERE id = ?').run(loanId);
    
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
});

// Sign contract
router.post('/:id/sign', authMiddleware, (req, res) => {
  try {
    const { role } = req.body;
    const loanId = req.params.id;
    
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    
    let updates = [];
    let params = [];
    
    if (role === 'lender' && loan.lender_id === req.userId) {
      updates.push('contract_signed_lender = 1');
    } else if (role === 'borrower') {
      if (loan.borrower_id !== req.userId) {
        return res.status(403).json({ error: 'Not authorized as borrower' });
      }
      updates.push('contract_signed_borrower = 1');
      updates.push('borrower_id = ?');
      params.push(req.userId);
      updates.push('borrower_name = ?');
      params.push(user.full_name);
      updates.push('borrower_passport = ?');
      params.push(`${user.passport_series || ''} ${user.passport_number || ''}`.trim());
    } else {
      return res.status(400).json({ error: 'Invalid role or unauthorized' });
    }
    
    // Check if both signed - activate loan
    const checkLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    if (updates.length > 0) {
      params.push(loanId);
      db.prepare(`
        UPDATE loans SET ${updates.join(', ')}, updated_date = datetime('now')
        WHERE id = ?
      `).run(...params);
    }
    
    const updatedLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    
    // If both signed, activate and create payment schedule
    if (updatedLoan.contract_signed_lender && updatedLoan.contract_signed_borrower) {
      db.prepare(`
        UPDATE loans SET status = 'active', updated_date = datetime('now')
        WHERE id = ?
      `).run(loanId);
      
      // Create payment schedule
      if (updatedLoan.monthly_payment > 0) {
        const startDate = new Date(updatedLoan.start_date);
        for (let i = 1; i <= updatedLoan.term_months; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          
          db.prepare(`
            INSERT INTO payments (id, loan_id, amount, principal_amount, interest_amount, due_date, status, payment_number)
            VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)
          `).run(
            uuidv4(), loanId,
            updatedLoan.monthly_payment,
            Math.round(updatedLoan.amount / updatedLoan.term_months),
            Math.round(updatedLoan.total_interest / updatedLoan.term_months),
            dueDate.toISOString().split('T')[0],
            i
          );
        }
      }
    }
    
    const finalLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    finalLoan.payment_receipts = JSON.parse(finalLoan.payment_receipts || '[]');
    
    res.json({ data: finalLoan });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
});

export default router;
