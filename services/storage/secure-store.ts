// Wrapper simple pour SecureStore - Gestion des tokens
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'api_token';
const ENCRYPTION_KEY = 'encryption_key';

// Tokens d'authentification
export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Clé de chiffrement
export async function storeEncryptionKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(ENCRYPTION_KEY, key);
}

export async function getEncryptionKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(ENCRYPTION_KEY);
}
