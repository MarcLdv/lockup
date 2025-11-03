import { Platform } from 'react-native';

const envUrl = process.env.EXPO_PUBLIC_API_URL;

export function getApiBase(): string {
  if (envUrl) return envUrl;
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  // Web/iOS simulateur
  return 'http://localhost:3000';
}
export const BASE_API_URL = getApiBase();
