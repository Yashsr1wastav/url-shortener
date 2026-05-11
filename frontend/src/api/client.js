import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const client = axios.create({
  baseURL,
  timeout: 20000,
});

const statsApi = axios.create({
  baseURL,
  timeout: 6000,
});

export async function shortenUrl(data) {
  const res = await client.post('/api/shorten', data, { timeout: 20000 });
  return res.data;
}

export async function getAnalytics(code) {
  const res = await client.get(`/api/analytics/${encodeURIComponent(code)}`);
  return res.data;
}

export async function getSystemStats() {
  const res = await statsApi.get('/api/system/stats');
  return res.data;
}

export async function getRecentQueries() {
  const res = await client.get('/api/system/recent-queries');
  return res.data;
}

export async function checkCache(code) {
  const res = await client.get(`/api/system/cache/${encodeURIComponent(code)}`);
  return res.data;
}

export default client;
