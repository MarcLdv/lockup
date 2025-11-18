import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast, { ToastType } from '../../components/Toast';
import { encrypt } from '../../services/crypto/encryption';
import { addVaultItem } from '../../services/storage/vault-storage';

export default function AddPassword() {
  const router = useRouter();

  const [pseudo, setPseudo] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as ToastType });

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const saveEntry = async () => {
    if (!pseudo || !url || !password) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setLoading(true);
    try {
      const encryptedPassword = await encrypt(password);
      await addVaultItem(pseudo, url, encryptedPassword);
      showToast('Mot de passe enregistré', 'success');
      setTimeout(() => router.back(), 300);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      showToast('Impossible d\'enregistrer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible}
        onHide={() => setToast({ ...toast, visible: false })}
      />
      
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={20} color="#4F46E5" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Nouveau mot de passe</Text>
      <Text style={styles.subtitle}>Sécurisez vos identifiants</Text>

      <TextInput
        style={styles.input}
        placeholder="Service (ex: Gmail, Netflix)"
        placeholderTextColor="#9CA3AF"
        value={pseudo}
        onChangeText={setPseudo}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="URL (ex: https://gmail.com)"
        placeholderTextColor="#9CA3AF"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={saveEntry}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <FontAwesome name="lock" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Enregistrer</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
