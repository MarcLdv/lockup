// Service de stockage local des mots de passe (V1)
// Utilise AsyncStorage pour stocker les données dans un fichier texte JSON
import AsyncStorage from '@react-native-async-storage/async-storage';

const VAULT_KEY = 'vault_items';

export interface VaultItem {
  id: number;
  pseudo: string;
  url: string;
  password_encrypted: string;
  created_at: string;
}

/**
 * Récupère tous les éléments du coffre-fort
 */
export async function getVaultItems(): Promise<VaultItem[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(VAULT_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture du coffre-fort:', error);
    return [];
  }
}

/**
 * Ajoute un nouvel élément au coffre-fort
 */
export async function addVaultItem(
  pseudo: string,
  url: string,
  encryptedPassword: string
): Promise<VaultItem> {
  try {
    const items = await getVaultItems();
    
    // Génère un ID unique (max + 1)
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    
    const newItem: VaultItem = {
      id: newId,
      pseudo,
      url,
      password_encrypted: encryptedPassword,
      created_at: new Date().toISOString(),
    };
    
    items.push(newItem);
    await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(items));
    
    return newItem;
  } catch (error) {
    console.error('Erreur lors de l\'ajout au coffre-fort:', error);
    throw error;
  }
}

/**
 * Met à jour un élément existant
 */
export async function updateVaultItem(
  id: number,
  data: Partial<Omit<VaultItem, 'id' | 'created_at'>>
): Promise<void> {
  try {
    const items = await getVaultItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Élément avec l'id ${id} introuvable`);
    }
    
    items[index] = { ...items[index], ...data };
    await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }
}

/**
 * Supprime un élément du coffre-fort
 */
export async function deleteVaultItem(id: number): Promise<void> {
  try {
    const items = await getVaultItems();
    const filteredItems = items.filter(item => item.id !== id);
    await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(filteredItems));
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
}

/**
 * Efface toutes les données du coffre-fort
 */
export async function clearVault(): Promise<void> {
  try {
    await AsyncStorage.removeItem(VAULT_KEY);
  } catch (error) {
    console.error('Erreur lors du nettoyage du coffre-fort:', error);
    throw error;
  }
}
