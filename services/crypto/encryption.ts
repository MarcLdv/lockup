import CryptoJS from 'crypto-js';
import { getEncryptionKey as getStoredKey, storeEncryptionKey } from '../storage/secure-store';

function generateRandomKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

// Récupère ou génère une clé de chiffrement locale
// La clé est unique par appareil et stockée dans le Keychain/Keystore
async function getEncryptionKey(): Promise<string> {
  let key = await getStoredKey();
  
  if (!key) {
    key = generateRandomKey();
    await storeEncryptionKey(key);
  }
  
  return key;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
