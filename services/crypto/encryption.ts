import CryptoJS from 'crypto-js';
import * as ExpoCrypto from 'expo-crypto';
import { getEncryptionKey } from '../storage/unlock-storage';

// Dérive une clé avec PBKDF2 (plus sécurisé)
async function deriveKey(password: string, salt: string): Promise<CryptoJS.lib.WordArray> {
  return CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 });
}

// Génère un IV aléatoire de 16 octets (32 caractères hex)
async function generateIV(): Promise<string> {
  const bytes = await ExpoCrypto.getRandomBytesAsync(16);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function encrypt(plaintext: string): Promise<string> {
  const password = await getEncryptionKey();
  if (!password) throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  const iv = await generateIV();
  const key = await deriveKey(password, iv);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv: CryptoJS.enc.Hex.parse(iv) });
  // Format : iv:ciphertext
  return `${iv}:${encrypted.toString()}`;
}

export async function decrypt(ciphertext: string): Promise<string> {
  const password = await getEncryptionKey();
  if (!password) throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  const [iv, ct] = ciphertext.split(':');
  if (!iv || !ct) throw new Error('Format de texte chiffré invalide');
  const key = await deriveKey(password, iv);
  const decrypted = CryptoJS.AES.decrypt(ct, key, { iv: CryptoJS.enc.Hex.parse(iv) });
  const result = decrypted.toString(CryptoJS.enc.Utf8);
  if (!result) {
    console.warn('Déchiffrement vide ou invalide pour:', ciphertext);
  }
  return result;
}
