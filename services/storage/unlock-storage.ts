import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { debugLog } from '../../constants/config';

const SECRET_CODE_KEY = 'master_password_hash';
const IS_CONFIGURED_KEY = 'is_configured';
const SALT_KEY = 'password_salt';
const ENCRYPTION_SALT_KEY = 'encryption_salt';

const PBKDF2_ITERATIONS = 10000;

let encryptionKeyInMemory: string | null = null;

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
    const passwordSalt = await generateSalt();
    const encryptionSalt = await generateSalt();
    const hashedPassword = hashPassword(masterPassword, passwordSalt);
    
    await SecureStore.setItemAsync(SECRET_CODE_KEY, hashedPassword);
    await SecureStore.setItemAsync(SALT_KEY, passwordSalt);
    await SecureStore.setItemAsync(ENCRYPTION_SALT_KEY, encryptionSalt);
    await AsyncStorage.setItem(IS_CONFIGURED_KEY, 'true');
    
    encryptionKeyInMemory = CryptoJS.PBKDF2(masterPassword, encryptionSalt, {
      keySize: 256 / 32,
      iterations: PBKDF2_ITERATIONS
    }).toString();
    
    debugLog('SETUP', 'Mot de passe maître configuré', {
      passwordLength: masterPassword.length,
      saltLength: encryptionSalt.length,
      keyLength: encryptionKeyInMemory.length
    });
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
    
    if (isValid) {
      const encryptionSalt = await SecureStore.getItemAsync(ENCRYPTION_SALT_KEY);
      if (!encryptionSalt) {
        throw new Error('Salt de chiffrement introuvable');
      }
      
      encryptionKeyInMemory = CryptoJS.PBKDF2(masterPassword, encryptionSalt, {
        keySize: 256 / 32,
        iterations: PBKDF2_ITERATIONS
      }).toString();
      
      debugLog('UNLOCK', 'Clé de chiffrement dérivée en RAM', {
        keyLength: encryptionKeyInMemory.length
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return false;
  }
}

export function getEncryptionKey(): string | null {
  return encryptionKeyInMemory;
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

export function lockApp(): void {
  const hadKey = encryptionKeyInMemory !== null;
  encryptionKeyInMemory = null;
  debugLog('LOCK', 'Application verrouillée', { hadKeyInMemory: hadKey });
  console.log('Application verrouillée');
}

export async function resetApp(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECRET_CODE_KEY);
    await SecureStore.deleteItemAsync(SALT_KEY);
    await SecureStore.deleteItemAsync(ENCRYPTION_SALT_KEY);
    await AsyncStorage.removeItem(IS_CONFIGURED_KEY);
    encryptionKeyInMemory = null;
    console.log('Application réinitialisée');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    throw error;
  }
}
