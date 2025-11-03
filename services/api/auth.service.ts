// Service d'authentification - Endpoints login, register
import { deleteToken, storeToken } from '../storage/secure-store';
import { apiFetch } from './client';

export async function login(email: string, password: string) {
  const data = await apiFetch('/api/auth/login', { 
    method: 'POST', 
    body: JSON.stringify({ email, password }) 
  });
  if (data.token) {
    await storeToken(data.token);
  }
  return data;
}

export async function register(email: string, password: string) {
  const data = await apiFetch('/api/auth/register', { 
    method: 'POST', 
    body: JSON.stringify({ email, password }) 
  });
  if (data.token) {
    await storeToken(data.token);
  }
  return data;
}

export async function logout() {
  await deleteToken();
}
