import CryptoJS from 'crypto-js';
import { getEncryptionKey } from '../storage/unlock-storage';

// V1 : Utilise le code secret de 6 caractères comme clé de chiffrement
// V2 : Migration vers une clé dérivée avec PBKDF2 pour plus de sécurité

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  
  if (!key) {
    throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  }
  
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  
  if (!key) {
    throw new Error('Clé de chiffrement non disponible. Veuillez déverrouiller l\'application.');
  }
  
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
