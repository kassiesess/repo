import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get insurance companies
router.get('/companies', authMiddleware, (req, res) => {
  try {
    const { active_only = 'true' } = req.query;
    
    let query = 'SELECT * FROM insurance_companies';
    if (active_only === 'true') {
      query += ' WHERE is_active = 1';
    }
    
    const companies = db.prepare(query).all();
    
    res.json({ data: companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to get insurance companies' });
  }
});

// Get user insurances
router.get('/', authMiddleware, (req, res) => {
  try {
    const insurances = db.prepare(`
      SELECT * FROM loan_insurances WHERE user_id = ? ORDER BY created_date DESC
    `).all(req.userId);
    
    res.json({ data: insurances });
  } catch (error) {
    console.error('Get insurances error:', error);
    res.status(500).json({ error: 'Failed to get insurances' });
  }
});

// Create insurance
router.post('/', authMiddleware, (req, res) => {
  try {
    const {
      loan_id, insurance_company_id, company_name,
      loan_amount, term_months, insurance_rate,
      premium_amount, coverage_percent, policy_number,
      payment_receipt_url, start_date, end_date
    } = req.body;
    
    if (!loan_id) {
      return res.status(400).json({ error: 'loan_id required' });
    }
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO loan_insurances (
        id, loan_id, user_id, insurance_company_id, company_name,
        loan_amount, term_months, insurance_rate,
        premium_amount, coverage_percent, policy_number,
        payment_receipt_url, start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      id, loan_id, req.userId, insurance_company_id, company_name,
      loan_amount, term_months, insurance_rate,
      premium_amount, coverage_percent, policy_number,
      payment_receipt_url, start_date, end_date
    );
    
    const insurance = db.prepare('SELECT * FROM loan_insurances WHERE id = ?').get(id);
    
    res.status(201).json({ data: insurance });
  } catch (error) {
    console.error('Create insurance error:', error);
    res.status(500).json({ error: 'Failed to create insurance' });
  }
});

// Check insurance eligibility
router.get('/eligibility/:loanId', authMiddleware, (req, res) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.loanId);
    
    if (!loan) {
      return res.json({ data: { eligible: false, reason: 'Loan not found' } });
    }
    
    const isActive = loan.status === 'active';
    const isWithinTerm = new Date(loan.end_date) > new Date();
    const isEligible = isActive && isWithinTerm;
    
    res.json({
      data: {
        eligible: isEligible,
        reason: isEligible ? 'Loan is active and within term' : 'Loan does not meet eligibility criteria'
      }
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

export default router;
