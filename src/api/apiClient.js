/**
 * API Client - Connects frontend to the standalone backend
 * Set VITE_API_URL in .env to connect to your backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Storage keys for local storage
const STORAGE_KEYS = {
  TOKEN: 'lend_token',
  USER: 'lend_user',
};

// Get stored token
const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

// Helper for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Initialize demo user if needed
const initializeDemoUser = () => {
  let user = localStorage.getItem(STORAGE_KEYS.USER);
  if (!user) {
    user = {
      id: generateUUID(),
      email: 'demo@example.com',
      full_name: 'Демо Пользователь',
      verification_status: 'approved',
      language: 'ru',
      two_factor_enabled: false,
      biometric_enabled: false,
      created_date: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
  return JSON.parse(user);
};

// ============================================
// API Client - connects to backend
// ============================================
export const api = {
  // Auth
  auth: {
    async register(email, password, fullName) {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      }
      return data;
    },
    
    async login(email, password) {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      }
      return data;
    },
    
    async me() {
      try {
        const data = await apiRequest('/auth/me');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
        return data.data;
      } catch {
        // Return demo user if not authenticated
        return initializeDemoUser();
      }
    },
    
    async updateMe(updates) {
      const data = await apiRequest('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
      return data.data;
    },
    
    logout() {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },
  },

  // Loans
  loans: {
    async list(sort = '-created_date', limit = 100) {
      const data = await apiRequest(`/loans?sort=${sort}&limit=${limit}`);
      return data.data || [];
    },
    
    async get(id) {
      const data = await apiRequest(`/loans/${id}`);
      return data.data;
    },
    
    async create(loanData) {
      const data = await apiRequest('/loans', {
        method: 'POST',
        body: JSON.stringify(loanData),
      });
      return data.data;
    },
    
    async update(id, updates) {
      const data = await apiRequest(`/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.data;
    },
    
    async delete(id) {
      return apiRequest(`/loans/${id}`, { method: 'DELETE' });
    },
    
    async sign(id, role) {
      const data = await apiRequest(`/loans/${id}/sign`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      return data.data;
    },
    
    async filter(conditions) {
      const loans = await this.list();
      return loans.filter(loan => {
        return Object.entries(conditions).every(([key, value]) => loan[key] === value);
      });
    },
  },

  // Payments
  payments: {
    async list(loanId) {
      const data = await apiRequest(`/payments/loan/${loanId}`);
      return data.data || [];
    },
    
    async create(paymentData) {
      const data = await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      return data.data;
    },
    
    async update(id, updates) {
      return apiRequest(`/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  // Notifications
  notifications: {
    async list(limit = 50) {
      const data = await apiRequest(`/notifications?limit=${limit}`);
      return { notifications: data.data || [], unread_count: data.unread_count || 0 };
    },
    
    async markRead(id) {
      return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    },
    
    async markAllRead() {
      return apiRequest('/notifications/read-all', { method: 'PUT' });
    },
  },

  // Users
  users: {
    async get(id) {
      const data = await apiRequest(`/users/${id}`);
      return data.data;
    },
    
    async search(query) {
      const data = await apiRequest(`/users/search/${query}`);
      return data.data || [];
    },
  },

  // Insurance
  insurance: {
    async getCompanies(activeOnly = true) {
      const data = await apiRequest(`/insurance/companies?active_only=${activeOnly}`);
      return data.data || [];
    },
    
    async list() {
      const data = await apiRequest('/insurance');
      return data.data || [];
    },
    
    async create(insuranceData) {
      const data = await apiRequest('/insurance', {
        method: 'POST',
        body: JSON.stringify(insuranceData),
      });
      return data.data;
    },
    
    async checkEligibility(loanId) {
      const data = await apiRequest(`/insurance/eligibility/${loanId}`);
      return data.data;
    },
  },

  // Chat
  chat: {
    async sendMessage(message, sessionId) {
      const data = await apiRequest('/chat/ai', {
        method: 'POST',
        body: JSON.stringify({ message, session_id: sessionId }),
      });
      return data.data;
    },
    
    async getHistory(sessionId) {
      const data = await apiRequest(`/chat/history/${sessionId}`);
      return data.data?.messages || [];
    },
    
    async getSessions() {
      const data = await apiRequest('/chat/sessions');
      return data.data || [];
    },
    
    async clearSession(sessionId) {
      return apiRequest(`/chat/session/${sessionId}`, { method: 'DELETE' });
    },
  },

  // File Upload
  upload: {
    async uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/upload/file`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.data;
    },
    
    async list() {
      const data = await apiRequest('/upload/files');
      return data.data || [];
    },
  },

  // Functions (cloud functions)
  functions: {
    async invoke(functionName, params = {}) {
      const data = await apiRequest('/functions/invoke', {
        method: 'POST',
        body: JSON.stringify({ function_name: functionName, params }),
      });
      return data;
    },
  },
};

export default api;
