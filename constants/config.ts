export const APP_CONFIG = {
  version: '2.0.0',
  name: 'Lockup',
  description: 'Gestionnaire de mots de passe sécurisé pour Android',
  storageMode: 'local',
  isDev: __DEV__,
  debugLogs: __DEV__,
};

export function debugLog(context: string, message: string, data?: any) {
  if (APP_CONFIG.debugLogs) {
    console.log(`[DEBUG ${context}]`, message, data || '');
  }
}
