import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import { debugLog } from '../../constants/config';
import { getEncryptionKey } from '../storage/unlock-storage';

async function generateIV(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function encrypt(plaintext: string): Promise<string> {
  const derivedKey = getEncryptionKey();
  if (!derivedKey) throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  
  const iv = await generateIV();
  const key = CryptoJS.enc.Hex.parse(derivedKey);
  
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, { 
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  const result = `${iv}:${encrypted.toString()}`;
  debugLog('ENCRYPT', 'Mot de passe chiffré', {
    plaintextLength: plaintext.length,
    ivLength: iv.length,
    ciphertextLength: result.length
  });
  
  return result;
}

export async function decrypt(ciphertext: string): Promise<string> {
  const derivedKey = getEncryptionKey();
  if (!derivedKey) throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  
  const [iv, ct] = ciphertext.split(':');
  if (!iv || !ct) throw new Error('Format de texte chiffré invalide');
  
  const key = CryptoJS.enc.Hex.parse(derivedKey);
  
  const decrypted = CryptoJS.AES.decrypt(ct, key, { 
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  const result = decrypted.toString(CryptoJS.enc.Utf8);
  if (!result) {
    throw new Error('Échec du déchiffrement');
  }
  
  debugLog('DECRYPT', 'Mot de passe déchiffré', {
    ivLength: iv.length,
    ciphertextLength: ct.length,
    plaintextLength: result.length
  });
  
  return result;
}
