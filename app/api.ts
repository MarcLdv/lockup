// Fichier route minimal pour éviter le warning Expo Router.
// Toute la logique est dans ../lib/api.ts
export { apiFetch, login, register, listVault, createVaultEntry, testHealth } from '../lib/api';
export default function ApiStub() { return null; }
