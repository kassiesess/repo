/**
 * Mock Base44 Client - Standalone version without Base44
 * Uses localStorage for data persistence and simulates authentication
 */

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Storage keys
const STORAGE_KEYS = {
  USER: 'standalone_user',
  LOANS: 'standalone_loans',
  PAYMENTS: 'standalone_payments',
  INSURANCE_COMPANIES: 'standalone_insurance_companies',
  LOAN_INSURANCES: 'standalone_loan_insurances',
  NOTIFICATIONS: 'standalone_notifications',
  SETTINGS: 'standalone_settings',
  FILES: 'standalone_files',
  CHAT_SESSIONS: 'standalone_chat_sessions',
  CHAT_MESSAGES: 'standalone_chat_messages',
};

// Initialize with sample data if empty
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INSURANCE_COMPANIES)) {
    const companies = [
      { id: 'ic1', name: 'Кыргыз Иншуранс', is_active: true, description: 'Ведущая страховая компания КР' },
      { id: 'ic2', name: 'Альянс Страхование', is_active: true, description: 'Надежная защита ваших займов' },
      { id: 'ic3', name: 'Госстрах КР', is_active: true, description: 'Государственная страховая компания' },
    ];
    localStorage.setItem(STORAGE_KEYS.INSURANCE_COMPANIES, JSON.stringify(companies));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOAN_INSURANCES)) {
    localStorage.setItem(STORAGE_KEYS.LOAN_INSURANCES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FILES)) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify([]));
  }
};

// Initialize on load
initializeData();

// Helper functions
const getStoredData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock User (Simulated authenticated user)
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.loadUser();
  }

  loadUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  saveUser(user) {
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  async me() {
    if (!this.currentUser) {
      // Auto-create a demo user if none exists
      const demoUser = {
        id: generateUUID(),
        email: 'demo@example.com',
        full_name: 'Демо Пользователь',
        verification_status: 'approved',
        language: 'ru',
        two_factor_enabled: false,
        biometric_enabled: false,
        created_date: new Date().toISOString(),
      };
      this.saveUser(demoUser);
      return demoUser;
    }
    return this.currentUser;
  }

  async isAuthenticated() {
    return this.currentUser !== null || true; // Always authenticated in standalone mode
  }

  async updateMe(formData) {
    const user = await this.me();
    const updatedUser = { ...user, ...formData };
    this.saveUser(updatedUser);
    return updatedUser;
  }

  async logout(redirectUrl) {
    // In standalone mode, just clear local state but keep data
    // Comment out to keep user logged in:
    // this.currentUser = null;
    // localStorage.removeItem(STORAGE_KEYS.USER);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  redirectToLogin(redirectUrl) {
    // In standalone mode, just go to home
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }
}

// Mock Entities
class MockEntity {
  constructor(name, storageKey) {
    this.name = name;
    this.storageKey = storageKey;
  }

  async list(sortField = '-created_date', limit = 100) {
    let data = getStoredData(this.storageKey);
    
    // Handle sorting
    if (sortField) {
      const isDesc = sortField.startsWith('-');
      const field = isDesc ? sortField.slice(1) : sortField;
      data.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        const comparison = String(aVal).localeCompare(String(bVal));
        return isDesc ? -comparison : comparison;
      });
    }
    
    // Handle limit
    if (limit) {
      data = data.slice(0, limit);
    }
    
    return data;
  }

  async filter(conditions) {
    const data = getStoredData(this.storageKey);
    return data.filter(item => {
      return Object.entries(conditions).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  async get(id) {
    const data = getStoredData(this.storageKey);
    return data.find(item => item.id === id);
  }

  async create(fields) {
    const data = getStoredData(this.storageKey);
    const newItem = {
      id: generateUUID(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      ...fields,
    };
    data.push(newItem);
    setStoredData(this.storageKey, data);
    return newItem;
  }

  async update(id, fields) {
    const data = getStoredData(this.storageKey);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...fields,
        updated_date: new Date().toISOString(),
      };
      setStoredData(this.storageKey, data);
      return data[index];
    }
    throw new Error(`${this.name} not found`);
  }

  async delete(id) {
    const data = getStoredData(this.storageKey);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data.splice(index, 1);
      setStoredData(this.storageKey, data);
      return true;
    }
    return false;
  }
}

// Mock Functions (simulated cloud functions)
const mockFunctions = {
  async invoke(functionName, params) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (functionName) {
      case 'aiChat':
        return this.aiChat(params);
      case 'getChatHistory':
        return this.getChatHistory(params);
      case 'kycVerification':
        return this.kycVerification(params);
      case 'detectFraud':
        return this.detectFraud(params);
      case 'notifyLoanCreated':
        return this.notifyLoanCreated(params);
      case 'calculateCreditScore':
        return this.calculateCreditScore(params);
      case 'generateTaxReport':
        return this.generateTaxReport(params);
      case 'calculateLateFees':
        return this.calculateLateFees(params);
      case 'checkOverdueLoans':
        return this.checkOverdueLoans(params);
      case 'checkInsuranceEligibility':
        return this.checkInsuranceEligibility(params);
      case 'processAutomaticPayment':
        return this.processAutomaticPayment(params);
      case 'sendPaymentReminders':
        return this.sendPaymentReminders(params);
      case 'sendPushNotification':
        return this.sendPushNotification(params);
      case 'sendBulkNotifications':
        return this.sendBulkNotifications(params);
      case 'verifyDocument':
        return this.verifyDocument(params);
      case 'generateLoanContract':
        return this.generateLoanContract(params);
      case 'generateDigitalSignature':
        return this.generateDigitalSignature(params);
      case 'generateAnalyticsReport':
        return this.generateAnalyticsReport(params);
      case 'exportUserData':
        return this.exportUserData(params);
      case 'backupDatabase':
        return this.backupDatabase(params);
      default:
        console.warn(`Unknown function: ${functionName}`);
        return { data: null };
    }
  },

  async aiChat({ message, session_id }) {
    // Simple AI response simulation with proper response format
    const responses = {
      'привет': 'Здравствуйте! Чем могу помочь с вашими займами?',
      'здравствуйте': 'Здравствуйте! Чем могу помочь с вашими займами?',
      'здравствуй': 'Здравствуйте! Чем могу помочь с вашими займами?',
      'help': 'Я могу помочь вам с информацией о займах, платежах и верификации.',
      'help_ru': 'Я могу помочь вам с информацией о займах, платежах и верификации.',
      'как рассчитать проценты по займу?': 'Для расчета процентов используйте формулу: Сумма × Ставка × (Срок / 12). Например, при сумме 100 000 сом, ставке 12% годовых и сроке 6 месяцев: 100 000 × 0.12 × 0.5 = 6 000 сом процентов.',
      'какие документы нужны для займа?': 'Для оформления займа вам понадобятся: паспорт гражданина КР, ИНН, и контактные данные заемщика. При верификации потребуется фото паспорта и селфи.',
      'что делать при просрочке платежа?': 'При просрочке платежа: 1) Свяжитесь с другой стороной для урегулирования, 2) Оплатите задолженность как можно скорее, 3) При необходимости сгенерируйте исковое заявление через приложение.',
      'максимальная процентная ставка в кр?': 'В Кыргызской Республике максимальная процентная ставка по займам между физическими лицами не ограничена законодательно. Однако рекомендуется соблюдать разумные ставки и указывать их в договоре.'
    };
    
    const lowerMessage = message.toLowerCase();
    let response = responses[lowerMessage];
    
    if (!response) {
      response = `Я получил ваше сообщение: "${message}". В автономном режиме я предоставляю базовую информацию.\n\nВы можете спросить меня о:\n• Создании займов\n• Расчете процентов\n• Требованиях к документам\n• Действиях при просрочке\n• Юридических вопросах`;
    }

    // Save message to chat history
    const sessions = getStoredData(STORAGE_KEYS.CHAT_SESSIONS);
    const messages = getStoredData(STORAGE_KEYS.CHAT_MESSAGES);
    
    let session = sessions.find(s => s.id === session_id);
    if (!session) {
      session = { id: session_id || generateUUID(), created_date: new Date().toISOString() };
      sessions.push(session);
    }
    
    // Save user message
    messages.push({
      id: generateUUID(),
      session_id: session.id,
      role: 'user',
      content: message,
      created_date: new Date().toISOString(),
    });
    
    // Save assistant response
    messages.push({
      id: generateUUID(),
      session_id: session.id,
      role: 'assistant',
      content: response,
      created_date: new Date().toISOString(),
    });
    
    setStoredData(STORAGE_KEYS.CHAT_SESSIONS, sessions);
    setStoredData(STORAGE_KEYS.CHAT_MESSAGES, messages);
    
    // Return proper response format expected by AIAssistant component
    return { data: { reply: response } };
  },

  async getChatHistory({ session_id }) {
    const messages = getStoredData(STORAGE_KEYS.CHAT_MESSAGES);
    const sessionMessages = messages
      .filter(m => m.session_id === session_id)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    
    // Return proper response format expected by AIAssistant component
    return { data: { messages: sessionMessages } };
  },

  async kycVerification({ document_image, selfie_image, user_id }) {
    // Simulate KYC verification with proper response format
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% success rate simulation
    const isApproved = Math.random() > 0.1;
    
    // Return proper response format expected by VerificationFlow component
    return {
      data: {
        verified: isApproved,
        passport: {
          data: {
            full_name: 'Иванов Иван Иванович',
            series: 'ID',
            number: '1234567',
            inn: '12345678901234'
          },
          issues: isApproved ? [] : ['Документ нечеткий', 'Селфи не соответствует']
        }
      }
    };
  },

  async detectFraud({ borrower_data, loan_data }) {
    // Simple fraud detection simulation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        risk_score: Math.random() * 0.3, // Low risk
        is_suspicious: false,
        warnings: [],
      }
    };
  },

  async notifyLoanCreated({ loan_id, borrower_email }) {
    console.log(`Notification: Loan ${loan_id} created for ${borrower_email}`);
    return { data: { success: true } };
  },

  async calculateCreditScore({ userId }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const userLoans = loans.filter(l => l.lender_id === userId || l.borrower_id === userId);
    
    // Calculate score based on loan history
    const totalLoans = userLoans.length;
    const paidLoans = userLoans.filter(l => l.status === 'paid').length;
    const score = Math.min(850, 300 + (totalLoans * 50) + (paidLoans * 30));
    
    return {
      data: {
        score,
        grade: score >= 750 ? 'A' : score >= 650 ? 'B' : score >= 550 ? 'C' : 'D',
        factors: {
          payment_history: paidLoans > 0 ? 'good' : 'no_history',
          total_loans: totalLoans,
          paid_loans: paidLoans,
        },
      }
    };
  },

  async generateTaxReport({ userId, year }) {
    const payments = getStoredData(STORAGE_KEYS.PAYMENTS);
    const userPayments = payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      return paymentDate.getFullYear() === year && p.user_id === userId;
    });
    
    const totalInterest = userPayments.reduce((sum, p) => sum + (p.interest_amount || 0), 0);
    
    return {
      data: {
        year,
        user_id: userId,
        total_payments: userPayments.length,
        total_interest: totalInterest,
        report_date: new Date().toISOString(),
      }
    };
  },

  async calculateLateFees({ loan_id }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const loan = loans.find(l => l.id === loan_id);
    
    if (!loan) return { data: { error: 'Loan not found' } };
    
    const now = new Date();
    const dueDate = new Date(loan.end_date);
    const daysLate = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));
    
    if (daysLate === 0) return { data: { days_late: 0, late_fee: 0 } };
    
    const dailyRate = 0.001; // 0.1% per day
    const lateFee = loan.amount * dailyRate * daysLate;
    
    return {
      data: {
        days_late: daysLate,
        late_fee: Math.min(lateFee, loan.amount * 0.3), // Cap at 30%
      }
    };
  },

  async checkOverdueLoans({ userId }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const now = new Date();
    
    const overdueLoans = loans.filter(loan => {
      const isUserLoan = loan.lender_id === userId || loan.borrower_id === userId;
      const isOverdue = loan.status === 'active' && new Date(loan.end_date) < now;
      return isUserLoan && isOverdue;
    });
    
    return { data: { loans: overdueLoans, count: overdueLoans.length } };
  },

  async checkInsuranceEligibility({ userId, loanId }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const loan = loans.find(l => l.id === loanId);
    
    if (!loan) return { data: { eligible: false, reason: 'Loan not found' } };
    
    const isEligible = loan.status === 'active' && new Date(loan.end_date) > new Date();
    return {
      data: {
        eligible: isEligible,
        reason: isEligible ? 'Loan is active and within term' : 'Loan does not meet eligibility criteria'
      }
    };
  },

  async processAutomaticPayment({ loanId, paymentAmount }) {
    return { data: { success: true, transaction_id: generateUUID() } };
  },

  async sendPaymentReminders({ userId }) {
    return { data: { sent: 0 } };
  },

  async sendPushNotification({ userId, title, body }) {
    console.log(`Push notification to ${userId}: ${title} - ${body}`);
    return { data: { success: true } };
  },

  async sendBulkNotifications({ userIds, title, body }) {
    return { data: { sent: userIds.length } };
  },

  async verifyDocument({ file_url, document_type }) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: { verified: true, details: 'Document verified successfully' } };
  },

  async generateLoanContract({ loanId }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const loan = loans.find(l => l.id === loanId);
    
    if (!loan) return { data: { error: 'Loan not found' } };
    
    return {
      data: {
        contract_url: 'data:text/html;charset=utf-8,' + encodeURIComponent('<html><body><h1>Contract HTML</h1></body></html>'),
        contract_id: `CONTRACT-${loanId.substring(0, 8).toUpperCase()}`
      }
    };
  },

  async generateDigitalSignature({ userId, documentHash }) {
    return {
      data: {
        signature: `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        verified: true
      }
    };
  },

  async generateAnalyticsReport({ userId, startDate, endDate }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const payments = getStoredData(STORAGE_KEYS.PAYMENTS);
    
    const userLoans = loans.filter(l => l.lender_id === userId || l.borrower_id === userId);
    const userPayments = payments.filter(p => p.user_id === userId);
    
    return {
      data: {
        total_loans: userLoans.length,
        active_loans: userLoans.filter(l => l.status === 'active').length,
        total_payments: userPayments.length,
        total_amount_paid: userPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        report_period: { start: startDate, end: endDate }
      }
    };
  },

  async exportUserData({ userId }) {
    const loans = getStoredData(STORAGE_KEYS.LOANS);
    const payments = getStoredData(STORAGE_KEYS.PAYMENTS);
    
    const userData = {
      loans: loans.filter(l => l.lender_id === userId || l.borrower_id === userId),
      payments: payments.filter(p => p.user_id === userId),
      export_date: new Date().toISOString()
    };
    
    return {
      data: {
        download_url: 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userData, null, 2)),
        filename: `user_data_${userId.substring(0, 8)}.json`
      }
    };
  },

  async backupDatabase() {
    const backup = {
      loans: getStoredData(STORAGE_KEYS.LOANS),
      payments: getStoredData(STORAGE_KEYS.PAYMENTS),
      notifications: getStoredData(STORAGE_KEYS.NOTIFICATIONS),
      insurance_companies: getStoredData(STORAGE_KEYS.INSURANCE_COMPANIES),
      loan_insurances: getStoredData(STORAGE_KEYS.LOAN_INSURANCES),
      backup_date: new Date().toISOString()
    };
    
    return {
      data: {
        backup_id: generateUUID(),
        download_url: 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2)),
        size_bytes: new Blob([JSON.stringify(backup)]).size
      }
    };
  },
};

// Mock Integrations
const mockIntegrations = {
  Core: {
    async UploadFile({ file }) {
      // Convert file to base64 and store in localStorage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const files = getStoredData(STORAGE_KEYS.FILES);
          const fileData = {
            id: generateUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
            created_date: new Date().toISOString(),
          };
          files.push(fileData);
          setStoredData(STORAGE_KEYS.FILES, files);
          resolve({ file_url: reader.result });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
  },
};

// Mock App Logs
const mockAppLogs = {
  async logUserInApp(pageName) {
    console.log(`User visited: ${pageName}`);
    return true;
  },
};

// Create the mock Base44 client
export const base44 = {
  auth: new MockAuth(),
  entities: {
    Loan: new MockEntity('Loan', STORAGE_KEYS.LOANS),
    Payment: new MockEntity('Payment', STORAGE_KEYS.PAYMENTS),
    User: new MockEntity('User', STORAGE_KEYS.USER),
    InsuranceCompany: new MockEntity('InsuranceCompany', STORAGE_KEYS.INSURANCE_COMPANIES),
    LoanInsurance: new MockEntity('LoanInsurance', STORAGE_KEYS.LOAN_INSURANCES),
    Notification: new MockEntity('Notification', STORAGE_KEYS.NOTIFICATIONS),
  },
  functions: mockFunctions,
  integrations: mockIntegrations,
  appLogs: mockAppLogs,
};

export default base44;
