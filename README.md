# Lockup - Gestionnaire de mots de passe Android

> Application standalone de gestion de mots de passe sécurisée pour Android

## 🎯 Concept

Lockup est un gestionnaire de mots de passe. Toutes les données sont stockées de manière chiffrée directement sur l'appareil Android de l'utilisateur.

## 🔐 Sécurité

- **Code secret de 6 caractères** : Protège l'accès au coffre-fort
- **Chiffrement AES-256** : Tous les mots de passe sont chiffrés avec crypto-js
- **Stockage sécurisé** : Le code secret est stocké dans le Keychain/Keystore via expo-secure-store
- **Pas de compte** : Pas d'email, pas de serveur, pas de risque de fuite de données

## 📱 Fonctionnalités V1

- ✅ Configuration du code secret au premier démarrage
- ✅ Déverrouillage du coffre avec le code secret
- ✅ Ajout de mots de passe (pseudo + URL + mot de passe)
- ✅ Liste des mots de passe enregistrés
- ✅ Chiffrement automatique des mots de passe
- ✅ Verrouillage du coffre (retour à l'écran de déverrouillage)

## 🚀 Roadmap V2

- 🔄 Migration vers SQLite pour meilleures performances
- 🔄 Génération de mots de passe forts
- 🔄 Modification et suppression de mots de passe

## 🛠️ Technologies

- **React Native** + Expo (v54)
- **TypeScript**
- **AsyncStorage** : Stockage des données en fichier texte JSON (V1)
- **expo-secure-store** : Stockage du code secret dans Keychain/Keystore
- **crypto-js** : Chiffrement AES-256

## 📦 Installation et développement

### Prérequis

- Node.js (v18+)
- npm ou yarn
- Expo CLI installé globalement : `npm install -g expo-cli`

### Démarrage en développement

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm start

# Ou directement sur Android
npm run android
```

## 📲 Build APK pour release

### Avec EAS Build (recommandé)

```bash
# Installation d'EAS CLI
npm install -g eas-cli

# Connexion à votre compte Expo
eas login

# Configuration du projet (première fois)
eas build:configure

# Build de l'APK Android
eas build --platform android --profile preview
```

L'APK sera téléchargeable depuis votre tableau de bord Expo.

### Build local (alternative)

```bash
# Configuration
expo prebuild

# Build Android
npx react-native run-android --mode=release
```

## 🔄 Évolution V1 → V2

**V1 (actuelle)** : Stockage des mots de passe dans un fichier texte JSON via AsyncStorage

- Simple et fonctionnel
- Démontre l'architecture standalone
- Performances limitées avec beaucoup d'entrées

**V2 (prochaine)** : Migration vers SQLite

- Meilleures performances
- Requêtes plus rapides (recherche, tri, filtrage)
- Gestion d'un grand nombre d'entrées
- Relations entre tables (catégories, tags, historique)