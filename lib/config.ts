import { Platform } from 'react-native';
// Variable d'environnement (lancée avec EXPO_PUBLIC_API_URL=...)
const envUrl = process.env.EXPO_PUBLIC_API_URL;
export function getApiBase(): string {
  if (envUrl) return envUrl;
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}
export const BASE_API_URL = getApiBase();
console.log('[lib/config] BASE_API_URL =', BASE_API_URL);

