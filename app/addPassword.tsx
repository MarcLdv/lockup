import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';

// Récupère ou génère la clé de chiffrement
async function getEncryptionKey() {
  const creds = await Keychain.getGenericPassword();
  if (creds) return creds.password;
  const key = CryptoJS.lib.WordArray.random(32).toString(); // 32octets aléatoires
  await Keychain.setGenericPassword('encryption-key', key);
  return key;
}

// Chiffre une chaîne de caractères en AES
async function encrypt(text: string) {
  const key = await getEncryptionKey();
  return CryptoJS.AES.encrypt(text, key).toString();
}

export default function AddPassword() {
  const router = useRouter();

  const [pseudo, setPseudo] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');

  // Remplace cette valeur par ton token JWT obtenu après authentification
  const token = '<TON_JWT_ICI>';
  // Remplace l’URL par celle de ton backend (localhost, serveur, etc.)
  const API_URL = 'http://localhost:3000/api/vault';

  const saveEntry = async () => {
    if (!pseudo || !url || !password) {
      Alert.alert('Champs manquants', 'Merci de remplir tous les champs.');
      return;
    }

    try {
      // Chiffre le mot de passe avant l’envoi
      const encryptedPassword = await encrypt(password);

      const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pseudo,
        url,
        password_encrypted: encryptedPassword,
      }),
    });

    if (response.ok) {
      Alert.alert('Succès', 'Entrée enregistrée avec succès');
      router.push('/vault');
    } else {
      const message = await response.text();
      Alert.alert('Erreur', `Impossible d’enregistrer : ${message}`);
    }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Une erreur est survenue.');
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

      <TouchableOpacity style={styles.button} onPress={saveEntry}>
        <FontAwesome name="save" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Enregistrer</Text>
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