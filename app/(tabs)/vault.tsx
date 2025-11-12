import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../../services/api/auth.service';
import { listVaultItems } from '../../services/api/vault.service';
import { decrypt } from '../../services/crypto/encryption';

interface VaultItem {
  id: number;
  pseudo: string;
  url: string;
  password_encrypted: string;
  password_decrypted?: string;
  created_at: string;
}

export default function Vault() {
  const router = useRouter();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const responseData: VaultItem[] = await listVaultItems();
        // Déchiffre chaque mot de passe
        const decrypted = await Promise.all(
          responseData.map(async item => ({
            ...item,
            password_decrypted: await decrypt(item.password_encrypted),
          })),
        );
        setItems(decrypted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4F46E5" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mes mots de passe</Text>
      {items.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>
          Aucun mot de passe enregistré. Ajoutez-en un !
        </Text>
      ) : (
        items.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.pseudo}>{item.pseudo}</Text>
            <Text style={styles.url}>{item.url}</Text>
            <Text style={styles.password}>{item.password_decrypted}</Text>
          </View>
        ))
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/password/add')}>
        <Text style={styles.addButtonText}>+ Ajouter un mot de passe</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.addButton,{backgroundColor:'#EF4444'}]} onPress={async ()=>{ await logout(); router.replace('/(auth)/login'); }}>
        <Text style={styles.addButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F5F7FB' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  card: {
    backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  pseudo: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  url: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  password: { fontSize: 16, color: '#6B7280' },
  addButton: {
    marginTop: 24, backgroundColor: '#4F46E5', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});