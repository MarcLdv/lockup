import { debugLog } from '../../constants/config';
import { getDatabase } from '../database/sqlite';

export interface VaultItem {
  id: number;
  pseudo: string;
  url: string;
  password_encrypted: string;
  created_at: string;
}

/**
 * Récupère tous les mots de passe du coffre
 */
export async function getVaultItems(): Promise<VaultItem[]> {
  try {
    const db = getDatabase();
    const items = await db.getAllAsync<VaultItem>(
      'SELECT * FROM vault_items ORDER BY created_at DESC'
    );
    return items || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des mots de passe:', error);
    return [];
  }
}

/**
 * Ajoute un nouveau mot de passe au coffre
 */
export async function addVaultItem(
  pseudo: string,
  url: string,
  encryptedPassword: string
): Promise<VaultItem> {
  try {
    const db = getDatabase();
    
    const result = await db.runAsync(
      'INSERT INTO vault_items (pseudo, url, password_encrypted) VALUES (?, ?, ?)',
      [pseudo, url, encryptedPassword]
    );
    
    const newItem: VaultItem = {
      id: result.lastInsertRowId,
      pseudo,
      url,
      password_encrypted: encryptedPassword,
      created_at: new Date().toISOString(),
    };
    
    debugLog('VAULT', 'Mot de passe ajouté', {
      id: newItem.id,
      pseudo: pseudo,
      encryptedLength: encryptedPassword.length
    });
    console.log('Mot de passe ajouté:', newItem.id);
    return newItem;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du mot de passe:', error);
    throw error;
  }
}

export async function updateVaultItem(
  id: number,
  pseudo: string,
  url: string,
  encryptedPassword: string
): Promise<void> {
  try {
    const db = getDatabase();
    
    await db.runAsync(
      'UPDATE vault_items SET pseudo = ?, url = ?, password_encrypted = ? WHERE id = ?',
      [pseudo, url, encryptedPassword, id]
    );
    
    debugLog('VAULT', 'Mot de passe modifié', { id, pseudo });
    console.log('Mot de passe modifié:', id);
  } catch (error) {
    console.error('Erreur lors de la modification du mot de passe:', error);
    throw error;
  }
}

export async function deleteVaultItem(id: number): Promise<void> {
  try {
    const db = getDatabase();
    
    await db.runAsync('DELETE FROM vault_items WHERE id = ?', [id]);
    
    debugLog('VAULT', 'Mot de passe supprimé', { id });
    console.log('Mot de passe supprimé:', id);
  } catch (error) {
    console.error('Erreur lors de la suppression du mot de passe:', error);
    throw error;
  }
}


/**
 * Compte le nombre total de mots de passe
 */
export async function countVaultItems(): Promise<number> {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM vault_items'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Erreur lors du comptage:', error);
    return 0;
  }
}

/**
 * Efface tous les mots de passe du coffre
 */
export async function clearVault(): Promise<void> {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM vault_items');
    console.log('Coffre-fort vidé');
  } catch (error) {
    console.error('Erreur lors du nettoyage du coffre:', error);
    throw error;
  }
}
