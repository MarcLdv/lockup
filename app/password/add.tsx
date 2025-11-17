import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { encrypt } from '../../services/crypto/encryption';
import { addVaultItem } from '../../services/storage/vault-storage';

export default function AddPassword() {
  const router = useRouter();

  const [pseudo, setPseudo] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const saveEntry = async () => {
    if (!pseudo || !url || !password) {
      Alert.alert('Champs manquants', 'Merci de remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      // Chiffre le mot de passe avant le stockage
      const encryptedPassword = await encrypt(password);

      await addVaultItem(pseudo, url, encryptedPassword);

      Alert.alert('Succès', 'Mot de passe enregistré avec succès');
      router.back();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un mot de passe</Text>

      <TextInput
        style={styles.input}
        placeholder="Pseudo (nom d'utilisateur ou service)"
        value={pseudo}
        onChangeText={setPseudo}
      />
      <TextInput
        style={styles.input}
        placeholder="URL du service"
        value={url}
        onChangeText={setUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, loading && {opacity: 0.5}]} 
        onPress={saveEntry}
        disabled={loading}
      >
        <FontAwesome name="save" size={20} color="#FFF" />
        <Text style={styles.buttonText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F7FB',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1F2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
