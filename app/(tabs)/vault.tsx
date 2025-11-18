import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONFIG } from '../../constants/config';
import { decrypt } from '../../services/crypto/encryption';
import { closeDatabase } from '../../services/database/sqlite';
import { resetApp } from '../../services/storage/unlock-storage';
import { clearVault, getVaultItems, VaultItem } from '../../services/storage/vault-storage';

interface VaultItemDecrypted extends VaultItem {
  password_decrypted?: string;
}

export default function Vault() {
  const router = useRouter();
  const [items, setItems] = useState<VaultItemDecrypted[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<{[id: string]: boolean}>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const vaultItems = await getVaultItems();

      const decrypted = await Promise.all(
        vaultItems.map(async item => ({
          ...item,
          password_decrypted: await decrypt(item.password_encrypted),
        })),
      );
      setItems(decrypted);
    } catch (err) {
      console.error('Erreur lors du chargement du coffre:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const handleReset = () => {
    Alert.alert(
      'Réinitialiser l\'app',
      'Cela va supprimer TOUTES les données (mot de passe + coffre). Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearVault();
              await resetApp();
              await closeDatabase();
              Alert.alert('Réinitialisé', 'L\'app a été réinitialisée');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Erreur reset:', error);
              Alert.alert('Erreur', 'Impossible de réinitialiser');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4F46E5" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> Mes mots de passe</Text>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucun mot de passe enregistré</Text>
          <Text style={styles.emptySubtext}>Ajoutez votre premier mot de passe !</Text>
        </View>
      ) : (
        <>
          <Text style={styles.countText}>{items.length} mot(s) de passe</Text>
          {items.map(item => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.pseudo}>{item.pseudo}</Text>
              <Text style={styles.url}>{item.url}</Text>
              <View style={styles.passwordRow}>
                {item.password_decrypted ? (
                  <Text style={styles.password}>
                    {visiblePasswords[item.id]
                      ? item.password_decrypted
                      : '•'.repeat(item.password_decrypted.length || 8)}
                  </Text>
                ) : (
                  <Text style={[styles.password, {color: '#EF4444'}]}>Erreur de déchiffrement</Text>
                )}
                {item.password_decrypted && (
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility(item.id)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={visiblePasswords[item.id] ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/password/add')}>
        <Text style={styles.addButtonText}>+ Ajouter un mot de passe</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.addButton, {backgroundColor:'#EF4444', marginTop: 12}]} 
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text style={styles.addButtonText}>Verrouiller le coffre</Text>
      </TouchableOpacity>
      
      {APP_CONFIG.isDev && (
        <TouchableOpacity 
          style={[styles.addButton, {backgroundColor:'#F97316', marginTop: 12}]} 
          onPress={handleReset}
        >
          <Text style={styles.addButtonText}>Reset App (DEV)</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F5F7FB', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center', color: '#1F2937' },
  countText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  emptyState: { 
    padding: 32, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: { 
    fontSize: 16, 
    color: '#4B5563', 
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  pseudo: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  url: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  password: { fontSize: 16, color: '#6B7280', fontFamily: 'monospace', flex: 1 },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  addButton: {
    marginTop: 24, backgroundColor: '#4F46E5', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
