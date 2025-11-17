import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { isAppConfigured, setupSecretCode, verifySecretCode } from '../../services/storage/unlock-storage';

export default function UnlockScreen() {
  const router = useRouter();
  const [secretCode, setSecretCode] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  async function checkConfiguration() {
    const configured = await isAppConfigured();
    setIsFirstTime(!configured);
    setLoading(false);
  }

  async function handleUnlock() {
    if (secretCode.length !== 6) {
      Alert.alert('Code invalide', 'Le code doit contenir 6 caractères');
      return;
    }

    if (isFirstTime) {
      // Premier démarrage : configuration du code
      if (secretCode !== confirmCode) {
        Alert.alert('Erreur', 'Les codes ne correspondent pas');
        return;
      }
      
      try {
        await setupSecretCode(secretCode);
        Alert.alert('Configuré', 'Votre coffre-fort est maintenant sécurisé !');
        router.replace('/(tabs)/vault');
      } catch (error: any) {
        Alert.alert('Erreur', error.message);
      }
    } else {
      // Déverrouillage normal
      const isValid = await verifySecretCode(secretCode);
      
      if (isValid) {
        router.replace('/(tabs)/vault');
      } else {
        Alert.alert('Code incorrect', 'Le code saisi ne correspond pas');
        setSecretCode('');
      }
    }
  }

  if (loading) {
    return <View style={styles.container}><Text>Chargement...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isFirstTime ? 'Configuration du coffre' : 'Déverrouiller'}
      </Text>
      <Text style={styles.subtitle}>
        {isFirstTime 
          ? 'Choisissez un code secret de 6 caractères' 
          : 'Entrez votre code secret'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Code secret (6 caractères)"
        maxLength={6}
        secureTextEntry
        value={secretCode}
        onChangeText={setSecretCode}
        keyboardType="default"
        autoFocus
      />

      {isFirstTime && (
        <TextInput
          style={styles.input}
          placeholder="Confirmer le code"
          maxLength={6}
          secureTextEntry
          value={confirmCode}
          onChangeText={setConfirmCode}
          keyboardType="default"
        />
      )}

      <TouchableOpacity 
        style={[styles.button, secretCode.length !== 6 && styles.buttonDisabled]} 
        onPress={handleUnlock}
        disabled={secretCode.length !== 6 || (isFirstTime && confirmCode.length !== 6)}
      >
        <Text style={styles.buttonText}>
          {isFirstTime ? 'Créer mon coffre' : 'Déverrouiller'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FB', justifyContent: 'center' },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 8, textAlign: 'center', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#FFF', fontSize: 18, textAlign: 'center', letterSpacing: 4 },
  button: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
