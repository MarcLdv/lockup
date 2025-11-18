# Lockup

Gestionnaire de mots de passe standalone pour Android. Application de chiffrement local sans serveur ni compte utilisateur.

## Description

Lockup permet de stocker et gérer des mots de passe de manière sécurisée sur Android. Toutes les données sont chiffrées et stockées localement dans une base SQLite. L'application ne nécessite aucune connexion internet ni création de compte.

## Sécurité

L'architecture de Lockup repose sur un système de chiffrement en deux étapes :

1. **Authentication** : Le mot de passe maître est haché avec PBKDF2 (10 000 itérations) et un salt unique. Ce hash est stocké dans le Android Keystore via expo-secure-store pour vérifier l'identité de l'utilisateur.

2. **Chiffrement** : Une clé de chiffrement distincte est dérivée du mot de passe maître avec PBKDF2 et un second salt. Cette clé n'existe qu'en mémoire RAM pendant l'utilisation de l'application et disparaît lors du verrouillage. Les mots de passe sont chiffrés avec AES-256-CBC, chaque entrée utilisant un IV unique généré aléatoirement.

Cette architecture garantit que même en cas d'accès physique à l'appareil, les mots de passe restent protégés tant que l'application est verrouillée. Le mot de passe maître n'est jamais stocké sur l'appareil.

Voir [CDC.md](./CDC.md) pour le détail des fonctionnalités par version.

## Technologies

- **React Native** avec Expo SDK 54
- **TypeScript** pour le typage statique
- **SQLite** (expo-sqlite) pour le stockage local
- **crypto-js** pour le chiffrement AES-256 et PBKDF2
- **expo-secure-store** pour l'accès au Android Keystore
- **expo-crypto** pour la génération de valeurs aléatoires cryptographiquement sûres

## Prérequis

- Node.js 18 ou supérieur
- npm ou yarn
- Android Studio (pour l'émulateur ou build local)
- Compte Expo (pour EAS Build)

## Installation

```bash
# Cloner le repository
git clone https://github.com/MarcLdv/lockup.git
cd lockup

# Installer les dépendances
npm install
```

## Développement

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur Android (émulateur ou appareil connecté)
npm run android

# Lancer sur iOS (macOS uniquement)
npm run ios
```

## Build Production

### Avec EAS Build

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Configurer le projet (première fois uniquement)
eas build:configure

# Builder l'APK Android
eas build --platform android --profile preview
```

L'APK sera disponible au téléchargement depuis le dashboard Expo.
