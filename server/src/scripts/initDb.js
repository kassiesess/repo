import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/lend.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  passport_series TEXT,
  passport_number TEXT,
  inn TEXT,
  birth_date TEXT,
  verification_status TEXT DEFAULT 'not_started',
  verification_submitted_date TEXT,
  passport_front_url TEXT,
  passport_back_url TEXT,
  selfie_url TEXT,
  two_factor_enabled INTEGER DEFAULT 0,
  biometric_enabled INTEGER DEFAULT 0,
  notification_settings TEXT DEFAULT '{}',
  language TEXT DEFAULT 'ru',
  created_date TEXT DEFAULT (datetime('now')),
  updated_date TEXT DEFAULT (datetime('now'))
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  lender_id TEXT NOT NULL,
  lender_name TEXT,
  lender_passport TEXT,
  borrower_id TEXT,
  borrower_email TEXT,
  borrower_name TEXT,
  borrower_passport TEXT,
  amount REAL NOT NULL,
  interest_rate REAL DEFAULT 0,
  term_months INTEGER DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  total_interest REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  total_repayment REAL NOT NULL,
  monthly_payment REAL,
  monthly_payments INTEGER DEFAULT 0,
  amount_paid REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  contract_signed_lender INTEGER DEFAULT 0,
  contract_signed_borrower INTEGER DEFAULT 0,
  payment_receipts TEXT DEFAULT '[]',
  created_date TEXT DEFAULT (datetime('now')),
  updated_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lender_id) REFERENCES users(id),
  FOREIGN KEY (borrower_id) REFERENCES users(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  user_id TEXT,
  amount REAL NOT NULL,
  principal_amount REAL,
  interest_amount REAL,
  due_date TEXT,
  paid_date TEXT,
  status TEXT DEFAULT 'scheduled',
  payment_number INTEGER,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read INTEGER DEFAULT 0,
  link TEXT,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insurance Companies table
CREATE TABLE IF NOT EXISTS insurance_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  description TEXT,
  insurance_rate REAL DEFAULT 3,
  coverage_percent REAL DEFAULT 80,
  created_date TEXT DEFAULT (datetime('now'))
);

-- Loan Insurance table
CREATE TABLE IF NOT EXISTS loan_insurances (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  insurance_company_id TEXT,
  company_name TEXT,
  loan_amount REAL,
  term_months INTEGER,
  insurance_rate REAL,
  premium_amount REAL,
  coverage_percent REAL,
  status TEXT DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  policy_number TEXT,
  payment_receipt_url TEXT,
  payment_date TEXT,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (loan_id) REFERENCES loans(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat Sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  url TEXT NOT NULL,
  created_date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loans_lender ON loans(lender_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_payments_loan ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
`;

try {
  db.exec(createTables);
  console.log('✅ Database initialized successfully!');
  console.log(`📁 Database location: ${dbPath}`);
  
  // Insert default insurance companies
  const insertInsuranceCompanies = db.prepare(`
    INSERT OR IGNORE INTO insurance_companies (id, name, description, insurance_rate, coverage_percent)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const insuranceCompanies = [
    ['ic1', 'Кыргыз Иншуранс', 'Ведущая страховая компания КР', 2.5, 85],
    ['ic2', 'Альянс Страхование', 'Надежная защита ваших займов', 3.0, 80],
    ['ic3', 'Госстрах КР', 'Государственная страховая компания', 2.0, 90]
  ];
  
  for (const company of insuranceCompanies) {
    insertInsuranceCompanies.run(...company);
  }
  
  console.log('🏢 Insurance companies seeded');
  
} catch (error) {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
}

db.close();
console.log('✨ Done!');
