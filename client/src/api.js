// Simple API helper for dashboard
const API_URL = process.env.REACT_APP_API_URL || '';

export async function getStatus() {
  const res = await fetch(`${API_URL}/api/status`);
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  return res.json();
}

export async function sendTestEmail() {
  const res = await fetch(`${API_URL}/api/test-email`, { method: 'POST' });
  return res.json();
}
