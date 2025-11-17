// Configuration de l'application Lockup V1
// Mode standalone : toutes les données sont stockées localement sur l'appareil

export const APP_CONFIG = {
  version: '1.0.0',
  name: 'Lockup',
  description: 'Gestionnaire de mots de passe sécurisé pour Android',
  storageMode: 'local', // V1: stockage local avec AsyncStorage
};

export const SECURITY_CONFIG = {
  secretCodeLength: 6,
  encryptionAlgorithm: 'AES-256',
  storageLocation: 'AsyncStorage', // V2: SQLite
};
