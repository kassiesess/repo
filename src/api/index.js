/**
 * API Client - Unified exports for the lending app
 * 
 * Configuration via environment variables:
 * - VITE_USE_MOCK=true  - Use localStorage mock (default)
 * - VITE_API_URL=http://localhost:3001/api - Connect to real backend
 */

import mockClient from './base44Client.js';
import apiClient from './apiClient.js';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = !API_URL || import.meta.env.VITE_USE_MOCK === 'true';

// Select the appropriate client
const client = USE_MOCK ? mockClient : apiClient;

// Re-export everything from the selected client
export const base44 = client;

// Default export
export default client;

// Individual exports for specific use cases
export { mockClient, apiClient };
