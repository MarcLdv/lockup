import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register as apiRegister } from '../../services/api/auth.service';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Email et mot de passe requis');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await apiRegister(email, password);
      Alert.alert('Inscription', 'Compte créé, connecté');
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
      <Text style={styles.title}>Créer un compte</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={register} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '...' : 'S\'inscrire'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkBtn}>
        <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
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
