const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';

function authHeaders() {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return {};
    const s = JSON.parse(raw);
    if (s?.token) return { Authorization: `Bearer ${s.token}` };
    return {};
  } catch {
    return {};
  }
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export function apiGet(path, { query } = {}) {
  const q = query ? '?' + new URLSearchParams(query).toString() : '';
  return fetch(`${BASE_URL}${path}${q}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  }).then(handle);
}

export function apiPost(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body || {}),
  }).then(handle);
}

export function apiPatch(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body || {}),
  }).then(handle);
}

export function getSession() {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}
