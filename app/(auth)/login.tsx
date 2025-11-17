import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast, { ToastType } from '../../components/Toast';
import { initDatabase } from '../../services/database/sqlite';
import { isAppConfigured, setupSecretCode, verifySecretCode } from '../../services/storage/unlock-storage';

export default function UnlockScreen() {
  const router = useRouter();
  const [masterPassword, setMasterPassword] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as ToastType });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  async function initialize() {
    try {
      await initDatabase();
      
      const configured = await isAppConfigured();
      setIsFirstTime(!configured);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      showToast('Erreur lors de l\'initialisation', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock() {
    if (masterPassword.length < 4) {
      showToast('Le mot de passe doit contenir au moins 4 caractères', 'error');
      return;
    }

    if (isFirstTime && masterPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    setActionLoading(true);
    
    try {
      if (isFirstTime) {
        await setupSecretCode(masterPassword);
        showToast('Coffre-fort créé avec succès', 'success');
        setTimeout(() => router.replace('/(tabs)/vault'), 500);
      } else {
        const isValid = await verifySecretCode(masterPassword);
        
        if (isValid) {
          showToast('Déverrouillage réussi', 'success');
          setTimeout(() => router.replace('/(tabs)/vault'), 500);
        } else {
          showToast('Mot de passe incorrect', 'error');
          setMasterPassword('');
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Une erreur est survenue', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/lockup-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Initialisation...</Text>
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
      
      <Image
        source={require('../../assets/images/lockup-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        {isFirstTime ? 'Créer votre coffre-fort' : 'Bienvenue sur Lockup'}
      </Text>
      <Text style={styles.subtitle}>
        {isFirstTime 
          ? 'Choisissez un mot de passe pour sécuriser vos données' 
          : 'Déverrouillez votre coffre-fort sécurisé'}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mot de passe maître"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          value={masterPassword}
          onChangeText={setMasterPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          editable={!actionLoading}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <FontAwesome 
            name={showPassword ? "eye" : "eye-slash"} 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
      </View>

      {isFirstTime && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!actionLoading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesome 
                name={showConfirmPassword ? "eye" : "eye-slash"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.hintContainer}>
            <View style={styles.hintDot} />
            <Text style={styles.hint}>Minimum 4 caractères (8+ recommandé)</Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, (masterPassword.length < 4 || actionLoading) && styles.buttonDisabled]} 
        onPress={handleUnlock}
        disabled={actionLoading || masterPassword.length < 4 || (isFirstTime && confirmPassword.length < 4)}
      >
        {actionLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            {isFirstTime ? 'Créer mon coffre-fort' : 'Déverrouiller'}
          </Text>
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
    justifyContent: 'center' 
  },
  logo: { 
    width: 120, 
    height: 120, 
    alignSelf: 'center', 
    marginBottom: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 8, 
    textAlign: 'center', 
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 16,
    paddingRight: 50,
    backgroundColor: '#FFF', 
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  button: { 
    backgroundColor: '#4F46E5', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center', 
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
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginRight: 8,
  },
  hint: { 
    color: '#6B7280', 
    fontSize: 13,
    fontWeight: '500',
  },
  loadingText: { 
    textAlign: 'center', 
    fontSize: 16, 
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
});

