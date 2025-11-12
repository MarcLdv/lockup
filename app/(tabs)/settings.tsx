import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BASE_API_URL } from '../../constants/config';
import { testHealth } from '../../services/api/client';

export default function HealthScreen() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  async function runTest() {
    setLoading(true);
    const result = await testHealth();
    if (result.ok) {
      setStatus('OK: ' + JSON.stringify(result.data));
    } else {
      setStatus('Erreur: ' + result.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    runTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Gérez vos informations personnelles</Text>
      <Text style={styles.subtitle}>Email : { }</Text>
      <Text style={styles.subtitle}>Mot de passe : { }</Text>
      
      <Text style={styles.title}>Diagnostic API</Text>
      <Text style={styles.url}>BASE_API_URL: {BASE_API_URL}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <Text style={styles.status}>{status}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={runTest}>
        <Text style={styles.buttonText}>Re-tester</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FB', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  url: { fontSize: 14, color: '#374151', marginBottom: 16, textAlign: 'center' },
  status: { fontSize: 16, color: '#111827', marginVertical: 16, textAlign: 'center' },
  button: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '600' },
});
