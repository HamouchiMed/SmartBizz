import { Platform } from 'react-native';

// Priority:
// 1) runtime override: global.__API_BASE_URL__
// 2) Expo env: EXPO_PUBLIC_API_URL
// 3) platform fallback
const LAN_FALLBACK = 'http://192.168.10.167:3001';
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : LAN_FALLBACK;

function getApiBase() {
  if (typeof global.__API_BASE_URL__ === 'string' && global.__API_BASE_URL__) return global.__API_BASE_URL__;
  if (typeof process?.env?.EXPO_PUBLIC_API_URL === 'string' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return DEFAULT_HOST;
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const base = getApiBase();
  console.log('API request:', method, base + path);
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data?.error || `Request failed: ${res.status}`;
    const details = data?.details ? ` (${data.details})` : '';
    throw new Error(`${msg}${details}`);
  }
  return data;
}

export async function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export async function register(name, email, password) {
  return request('/auth/register', { method: 'POST', body: { name, email, password } });
}

export async function getMe(token) {
  return request('/me', { token });
}

export async function listTransactions(token) {
  return request('/transactions', { token });
}

export async function createTransaction(token, payload) {
  return request('/transactions', { method: 'POST', token, body: payload });
}

export async function deleteTransaction(token, id) {
  return request(`/transactions/${id}`, { method: 'DELETE', token });
}

export async function getBalance(token) {
  return request('/balance', { token });
}

export async function updateBalance(token, amount) {
  return request('/balance', { method: 'PUT', token, body: { amount } });
}

export async function listLeads(token) {
  return request('/leads', { token });
}

export async function createLead(token, payload) {
  return request('/leads', { method: 'POST', token, body: payload });
}

export async function updateLead(token, id, payload) {
  return request(`/leads/${id}`, { method: 'PUT', token, body: payload });
}

export async function deleteLead(token, id) {
  return request(`/leads/${id}`, { method: 'DELETE', token });
}

export async function listProfiles(token) {
  return request('/profiles', { token });
}

export async function createProfile(token, payload) {
  return request('/profiles', { method: 'POST', token, body: payload });
}

export async function updateProfile(token, id, payload) {
  return request(`/profiles/${id}`, { method: 'PUT', token, body: payload });
}

export async function listEvents(token) {
  return request('/events', { token });
}

export async function createEvent(token, payload) {
  return request('/events', { method: 'POST', token, body: payload });
}

export async function updateEvent(token, id, payload) {
  return request(`/events/${id}`, { method: 'PUT', token, body: payload });
}

export async function deleteEvent(token, id) {
  return request(`/events/${id}`, { method: 'DELETE', token });
}

export async function listContacts(token) {
  return request('/contacts', { token });
}

export async function createContact(token, payload) {
  return request('/contacts', { method: 'POST', token, body: payload });
}

export async function updateContact(token, id, payload) {
  return request(`/contacts/${id}`, { method: 'PUT', token, body: payload });
}

export async function deleteContact(token, id) {
  return request(`/contacts/${id}`, { method: 'DELETE', token });
}

export async function listDeals(token) {
  return request('/deals', { token });
}

export async function createDeal(token, payload) {
  return request('/deals', { method: 'POST', token, body: payload });
}

export async function updateDeal(token, id, payload) {
  return request(`/deals/${id}`, { method: 'PUT', token, body: payload });
}

export async function deleteDeal(token, id) {
  return request(`/deals/${id}`, { method: 'DELETE', token });
}

export async function listMessages(token) {
  return request('/messages', { token });
}

export async function createMessage(token, payload) {
  return request('/messages', { method: 'POST', token, body: payload });
}

export async function updateMessage(token, id, payload) {
  return request(`/messages/${id}`, { method: 'PUT', token, body: payload });
}

export async function deleteMessage(token, id) {
  return request(`/messages/${id}`, { method: 'DELETE', token });
}

