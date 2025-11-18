import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast, { ToastType } from '../../components/Toast';
import { decrypt, encrypt } from '../../services/crypto/encryption';
import { getVaultItems, updateVaultItem } from '../../services/storage/vault-storage';

export default function EditPassword() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pseudo, setPseudo] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as ToastType });

  useEffect(() => {
    loadItem();
  }, [id]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const loadItem = async () => {
    try {
      const items = await getVaultItems();
      const item = items.find(i => i.id === parseInt(id as string));
      
      if (!item) {
        showToast('Entrée introuvable', 'error');
        router.back();
        return;
      }

      setPseudo(item.pseudo);
      setUrl(item.url);
      setPassword(await decrypt(item.password_encrypted));
    } catch (error) {
      console.error('Erreur chargement:', error);
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pseudo.trim() || !url.trim() || !password.trim()) {
      showToast('Tous les champs sont requis', 'error');
      return;
    }

    setSaving(true);
    try {
      const encryptedPassword = await encrypt(password);
      await updateVaultItem(parseInt(id as string), pseudo.trim(), url.trim(), encryptedPassword);
      
      showToast('Mot de passe modifié', 'success');
      setTimeout(() => router.back(), 500);
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la modification', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <Text style={styles.title}>Modifier le mot de passe</Text>

      <Text style={styles.label}>Pseudo / Identifiant</Text>
      <TextInput
        style={styles.input}
        placeholder="ex: john.doe@gmail.com"
        placeholderTextColor="#9CA3AF"
        value={pseudo}
        onChangeText={setPseudo}
        autoCapitalize="none"
        editable={!saving}
      />

      <Text style={styles.label}>URL / Application</Text>
      <TextInput
        style={styles.input}
        placeholder="ex: gmail.com"
        placeholderTextColor="#9CA3AF"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        editable={!saving}
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        placeholder="Mot de passe à sécuriser"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!saving}
      />

      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24, color: '#1F2937' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#6B7280', fontSize: 16, fontWeight: '500' },
});
