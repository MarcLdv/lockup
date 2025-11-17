import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SECRET_CODE_KEY = 'master_password_hash';
const IS_CONFIGURED_KEY = 'is_configured';
const SALT_KEY = 'password_salt';
const ENCRYPTION_SALT_KEY = 'encryption_salt';

const PBKDF2_ITERATIONS = 10000;

/**
 * Vérifie si l'application a déjà été configurée (mot de passe maître défini)
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
 * Génère un salt aléatoire
 */
async function generateSalt(): Promise<string> {
  // Génère 32 octets (256 bits) de données aléatoires
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash le mot de passe avec PBKDF2
 */
function hashPassword(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS
  }).toString();
}

/**
 * Configure le mot de passe maître lors du premier démarrage
 * @param masterPassword Mot de passe maître
 */
export async function setupSecretCode(masterPassword: string): Promise<void> {
  if (masterPassword.length < 4) {
    throw new Error('Le mot de passe maître doit contenir au moins 4 caractères');
  }

  try {
    // Génère un salt pour le hash du mot de passe maître
    const passwordSalt = await generateSalt();
    
    // Génère un salt fixe différent pour le chiffrement AES
    const encryptionSalt = await generateSalt();

    const hashedPassword = hashPassword(masterPassword, passwordSalt);
    
    // Stocke le hash, les salts dans SecureStore
    await SecureStore.setItemAsync(SECRET_CODE_KEY, hashedPassword);
    await SecureStore.setItemAsync(SALT_KEY, passwordSalt);
    await SecureStore.setItemAsync(ENCRYPTION_SALT_KEY, encryptionSalt);
    
    await AsyncStorage.setItem(IS_CONFIGURED_KEY, 'true');
    
    // Stocke le mot de passe en clair dans SecureStore pour servir de clé de chiffrement
    await SecureStore.setItemAsync('encryption_key', masterPassword);
    
    console.log('Mot de passe maître configuré');
  } catch (error) {
    console.error('Erreur lors de la configuration du mot de passe:', error);
    throw error;
  }
}

/**
 * Vérifie le mot de passe maître saisi par l'utilisateur
 * @param masterPassword Mot de passe saisi
 * @returns true si le mot de passe est correct, false sinon
 */
export async function verifySecretCode(masterPassword: string): Promise<boolean> {
  if (masterPassword.length < 4) {
    return false;
  }

  try {
    const storedHash = await SecureStore.getItemAsync(SECRET_CODE_KEY);
    const salt = await SecureStore.getItemAsync(SALT_KEY);
    
    if (!storedHash || !salt) {
      throw new Error('Aucun mot de passe maître configuré');
    }
    
    const inputHash = hashPassword(masterPassword, salt);
    const isValid = storedHash === inputHash;
    
    // Si le mot de passe est correct, le stocker temporairement pour le chiffrement
    if (isValid) {
      await SecureStore.setItemAsync('encryption_key', masterPassword);
    }
    
    return isValid;
    
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
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
 * Récupère le salt fixe utilisé pour le chiffrement AES
 */
export async function getEncryptionSalt(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ENCRYPTION_SALT_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du salt de chiffrement:', error);
    return null;
  }
}

/**
 * Réinitialise l'application (supprime le mot de passe et toutes les données)
 */
export async function resetApp(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECRET_CODE_KEY);
    await SecureStore.deleteItemAsync(SALT_KEY);
    await SecureStore.deleteItemAsync(ENCRYPTION_SALT_KEY);
    await SecureStore.deleteItemAsync('encryption_key');
    await AsyncStorage.removeItem(IS_CONFIGURED_KEY);
    console.log('Application réinitialisée');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    throw error;
  }
}
