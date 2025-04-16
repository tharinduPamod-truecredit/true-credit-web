import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your local Node.js server
});

export const testConnection = () => api.get('/db-check');
export default api;