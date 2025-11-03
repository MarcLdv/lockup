// Service du coffre-fort - CRUD des mots de passe
import { apiFetch } from './client';

export async function listVaultItems() {
  return apiFetch('/api/vault', { auth: true, method: 'GET' });
}

export async function createVaultItem(pseudo: string, url: string, encryptedPassword: string) {
  return apiFetch('/api/vault', { 
    auth: true, 
    method: 'POST', 
    body: JSON.stringify({ pseudo, url, password_encrypted: encryptedPassword }) 
  });
}

export async function updateVaultItem(id: number, data: any) {
  return apiFetch(`/api/vault/${id}`, { 
    auth: true, 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });
}

export async function deleteVaultItem(id: number) {
  return apiFetch(`/api/vault/${id}`, { 
    auth: true, 
    method: 'DELETE' 
  });
}
