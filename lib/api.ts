import * as SecureStore from 'expo-secure-store';
import { getApiBase } from './config';

interface ApiOptions extends RequestInit { auth?: boolean; timeoutMs?: number; }

async function getToken() {
  try { return await SecureStore.getItemAsync('api_token'); } catch { return null; }
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (options.auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    let data: any = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const message = data?.error || data?.message || res.statusText || 'Erreur réseau';
      const error = new Error(message);
      (error as any).status = res.status; (error as any).data = data;
      if (res.status === 401) {
        // Future: SecureStore.deleteItemAsync('api_token');
      }
      console.warn('[apiFetch] HTTP', res.status, 'URL:', url, 'Message:', message);
      throw error;
    }
    return data;
  } catch (err) {
    if ((err as any).name === 'AbortError') throw new Error('Timeout réseau');
    console.error('[apiFetch] Échec réseau sur', url, err);
    throw err;
  } finally { clearTimeout(timeout); }
}

export async function testHealth() { try { return { ok: true, data: await apiFetch('/health', { method: 'GET', timeoutMs: 7000 }) }; } catch (e:any) { return { ok: false, error: e.message }; } }
export async function login(email: string, password: string) { return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }
export async function register(email: string, password: string) { return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }); }
export async function listVault() { return apiFetch('/api/vault', { auth: true, method: 'GET' }); }
export async function createVaultEntry(pseudo: string, url: string, password_encrypted: string) { return apiFetch('/api/vault', { auth: true, method: 'POST', body: JSON.stringify({ pseudo, url, password_encrypted }) }); }
export async function logout() { await SecureStore.deleteItemAsync('api_token'); }

