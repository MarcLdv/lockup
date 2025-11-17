import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login as apiLogin } from '../../services/api/auth.service';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Email et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      await apiLogin(email, password);
      Alert.alert('Connecté', 'Connexion réussie');
      router.replace('/(tabs)/vault');
    } catch (e:any) {
      console.error(e);
      Alert.alert('Erreur', e.message || 'Problème réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '...' : 'Se connecter'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkBtn}>
        <Text style={styles.linkText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FB', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 24, textAlign: 'center', color: '#1F2937' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#FFF' },
  button: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#4F46E5', fontSize: 14, fontWeight: '500' },
});
