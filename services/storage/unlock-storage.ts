// Service d'authentification locale avec code secret de 6 caractères
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SECRET_CODE_KEY = 'secret_code_hash';
const IS_CONFIGURED_KEY = 'is_configured';

/**
 * Vérifie si l'application a déjà été configurée (code secret défini)
 */
export async function isAppConfigured(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(IS_CONFIGURED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Erreur lors de la vérification de configuration:', error);
    return false;
  }
}

/**
 * Hash simple du code secret (pour V1, pas cryptographiquement sécurisé)
 * En V2 avec SQLite, on pourra utiliser une vraie fonction de hashing
 */
function hashCode(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Configure le code secret lors du premier démarrage
 * @param secretCode Code secret de 6 caractères
 */
export async function setupSecretCode(secretCode: string): Promise<void> {
  if (secretCode.length !== 6) {
    throw new Error('Le code secret doit contenir exactement 6 caractères');
  }

  try {
    const hashedCode = hashCode(secretCode);
    
    // Stocke le hash dans SecureStore (Keychain/Keystore)
    await SecureStore.setItemAsync(SECRET_CODE_KEY, hashedCode);
    
    // Marque l'app comme configurée
    await AsyncStorage.setItem(IS_CONFIGURED_KEY, 'true');
    
    // Stocke également le code en clair dans SecureStore pour l'utiliser comme clé de chiffrement
    // En V1, on utilise le code secret comme clé de chiffrement AES
    await SecureStore.setItemAsync('encryption_key', secretCode);
    
  } catch (error) {
    console.error('Erreur lors de la configuration du code secret:', error);
    throw error;
  }
}

/**
 * Vérifie le code secret saisi par l'utilisateur
 * @param secretCode Code secret saisi
 * @returns true si le code est correct, false sinon
 */
export async function verifySecretCode(secretCode: string): Promise<boolean> {
  if (secretCode.length !== 6) {
    return false;
  }

  try {
    const storedHash = await SecureStore.getItemAsync(SECRET_CODE_KEY);
    
    if (!storedHash) {
      throw new Error('Aucun code secret configuré');
    }
    
    const inputHash = hashCode(secretCode);
    return storedHash === inputHash;
    
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return false;
  }
}

/**
 * Récupère la clé de chiffrement (le code secret en clair)
 * Doit être appelé APRÈS vérification du code
 */
export async function getEncryptionKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('encryption_key');
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé:', error);
    return null;
  }
}

/**
 * Réinitialise l'application (supprime le code secret et toutes les données)
 * ⚠️ À utiliser avec précaution : efface TOUTES les données
 */
export async function resetApp(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECRET_CODE_KEY);
    await SecureStore.deleteItemAsync('encryption_key');
    await AsyncStorage.removeItem(IS_CONFIGURED_KEY);
    await AsyncStorage.removeItem('vault_items');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    throw error;
  }
}
