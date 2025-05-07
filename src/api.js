import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your local Node.js server
});

// Existing exports
export const testConnection = () => api.get('/db-check');

// BankID Authentication Endpoints
export const initiateBankIDAuth = (endUserIP) => 
  api.post('/bankid/auth', { endUserIP });

export const collectBankIDResult = (orderRef) => 
  api.post('/bankid/collect', { orderRef });

export const cancelBankIDAuth = (orderRef) => 
  api.post('/bankid/cancel', { orderRef });

export const verifyBankIDSignature = (signatureData) => 
  api.post('/bankid/verify', signatureData);

export default api;