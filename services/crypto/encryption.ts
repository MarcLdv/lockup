import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import { getEncryptionKey, getEncryptionSalt } from '../storage/unlock-storage';

// Nombre d'itérations PBKDF2 (équilibre sécurité/performance mobile)
const PBKDF2_ITERATIONS = 10000;

// Dérive une clé avec PBKDF2 (Salt fixe par utilisateur)
function deriveKey(password: string, salt: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, { 
    keySize: 256 / 32, 
    iterations: PBKDF2_ITERATIONS 
  });
}

// Génère un IV aléatoire de 16 octets
async function generateIV(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function encrypt(plaintext: string): Promise<string> {
  const password = await getEncryptionKey();
  if (!password) throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  
  // Récupérer le salt fixe de l'utilisateur
  const salt = await getEncryptionSalt();
  if (!salt) throw new Error('Salt de chiffrement non disponible.');
  
  // Générer un IV unique pour ce chiffrement
  const iv = await generateIV();
  
  // Dériver la clé avec le salt fixe (pas l'IV)
  const key = deriveKey(password, salt);
  
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, { 
    iv: CryptoJS.enc.Hex.parse(iv) 
  });
  
  // Format : iv:ciphertext
  return `${iv}:${encrypted.toString()}`;
}

export async function decrypt(ciphertext: string): Promise<string> {
  const password = await getEncryptionKey();
  if (!password) throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  
  // Récupérer le salt fixe de l'utilisateur
  const salt = await getEncryptionSalt();
  if (!salt) throw new Error('Salt de chiffrement non disponible.');
  
  const [iv, ct] = ciphertext.split(':');
  if (!iv || !ct) throw new Error('Format de texte chiffré invalide');
  
  // Dériver la clé avec le salt fixe
  const key = deriveKey(password, salt);
  
  const decrypted = CryptoJS.AES.decrypt(ct, key, { 
    iv: CryptoJS.enc.Hex.parse(iv) 
  });
  
  const result = decrypted.toString(CryptoJS.enc.Utf8);
  if (!result) {
    console.warn('Déchiffrement vide ou invalide pour:', ciphertext);
  }
  return result;
}
