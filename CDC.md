# Cahier des charges - Lockup

## 📋 Résumé du projet

**Lockup** est un gestionnaire de mots de passe **standalone pour Android**. L'utilisateur configure un code secret de 6 caractères lors du premier démarrage, qui lui permet ensuite de déverrouiller son coffre-fort de mots de passe chiffrés.

---

## 🎯 Objectifs par version

### Version 1.0 - MVP Standalone

| Fonctionnalité | Description | Priorité | Statut |
|:--------------|:-----------|:--------:|:------:|
| **Configuration initiale** | Définir un code secret de 6 caractères au premier lancement | **Haute** | ✅ |
| **Déverrouillage** | Saisir le code secret pour accéder au coffre | **Haute** | ✅ |
| **Ajouter un mot de passe** | Stocker pseudo + URL + mot de passe chiffré | **Haute** | ✅ |
| **Lister les mots de passe** | Afficher tous les mots de passe déchiffrés | **Haute** | ✅ |
| **Chiffrement AES-256** | Chiffrer automatiquement avec le code secret | **Haute** | ✅ |
| **Verrouillage** | Retourner à l'écran de déverrouillage | **Haute** | ✅ |

**Technologies V1** :

- Stockage : AsyncStorage (fichier texte JSON)
- Chiffrement : crypto-js (AES-256)
- Code secret : expo-secure-store (Keychain/Keystore)

**Objectif** : Démontrer l'architecture standalone et le chiffrement local

---

### Version 2.0 - Amélioration et performance

| Fonctionnalité | Description | Priorité | Statut |
|:--------------|:-----------|:--------:|:------:|
| **Migration SQLite** | Remplacer AsyncStorage par SQLite | **Haute** | 🔄 |
| **Générateur de mots de passe** | Créer des mots de passe forts aléatoires | **Haute** | 🔄 |
| **Modification** | Éditer un mot de passe existant | **Haute** | 🔄 |
| **Suppression** | Supprimer une entrée du coffre | **Moyenne** | 🔄 |
| **Masquage/Affichage** | Toggle pour afficher/masquer les MDP | **Moyenne** | 🔄 |

**Technologies V2** :

- Stockage : expo-sqlite (base de données locale)
- Chiffrement : crypto-js ou react-native-quick-crypto
- UI/UX : Amélioration du design

**Objectif** : Performances accrues et fonctionnalités avancées

---

## 🏗️ Architecture technique

### Flux d'authentification (V1)

```
[Premier démarrage]
    ↓
[Saisie code secret 6 caractères] → Confirmation
    ↓
[Stockage hash du code dans SecureStore]
    ↓
[Code secret devient clé de chiffrement AES]

[Démarrage suivant]
    ↓
[Saisie code secret]
    ↓
[Vérification hash] → Succès → [Accès au coffre]
                    → Échec  → [Réessayer]
```

### Flux de stockage d'un mot de passe

```
[Utilisateur saisit : pseudo, URL, mdp]
    ↓
[Chiffrement AES avec code secret]
    ↓
[Stockage dans AsyncStorage (V1) ou SQLite (V2)]
    ↓
{
  id: 1,
  pseudo: "john@example.com",
  url: "https://gmail.com",
  password_encrypted: "U2FsdGVkX1...",
  created_at: "2025-11-17T10:30:00Z"
}
```

### Flux d'affichage

```
[Chargement des entrées depuis AsyncStorage/SQLite]
    ↓
[Déchiffrement avec le code secret en mémoire]
    ↓
[Affichage des mots de passe en clair]
```

---

## 🔐 Sécurité

### V1

| Mécanisme | Implémentation | Niveau |
|:----------|:---------------|:------:|
| **Code secret** | 6 caractères alphanumériques | ⭐⭐⭐ |
| **Stockage du hash** | SecureStore (Keychain/Keystore) | ⭐⭐⭐⭐ |
| **Chiffrement** | AES-256 avec code secret comme clé | ⭐⭐⭐ |
| **Fonction de hashing** | Hash simple JavaScript (32bit) | ⭐⭐ |

### V2 (améliorations prévues)

| Mécanisme | Implémentation | Niveau |
|:----------|:---------------|:------:|
| **Fonction de hashing** | PBKDF2 ou Argon2 | ⭐⭐⭐⭐⭐ |
| **Clé dérivée** | Dérivation de clé depuis le code | ⭐⭐⭐⭐⭐ |
| **Tentatives limitées** | Blocage après X échecs | ⭐⭐⭐⭐ |

---

## 📊 Schéma de données

### V1 - AsyncStorage (JSON)

```json
{
  "vault_items": [
    {
      "id": 1,
      "pseudo": "john@example.com",
      "url": "https://gmail.com",
      "password_encrypted": "U2FsdGVkX1+abcd1234...",
      "created_at": "2025-11-17T10:30:00Z"
    },
    {
      "id": 2,
      "pseudo": "john_doe",
      "url": "https://github.com",
      "password_encrypted": "U2FsdGVkX1+xyz9876...",
      "created_at": "2025-11-17T11:00:00Z"
    }
  ]
}
```

### V2 - SQLite

**Table: vault_items**

| Colonne | Type | Contraintes | Description |
|:--------|:-----|:-----------|:------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unique |
| pseudo | TEXT | NOT NULL | Identifiant/email |
| url | TEXT | NOT NULL | URL du service |
| password_encrypted | TEXT | NOT NULL | Mot de passe chiffré AES |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Date de modification |

**Table: app_config** (nouvelle)

| Colonne | Type | Contraintes | Description |
|:--------|:-----|:-----------|:------------|
| key | TEXT | PRIMARY KEY | Nom du paramètre |
| value | TEXT | NOT NULL | Valeur du paramètre |

---

## 🚀 Déploiement

### Build APK

```bash
# Avec EAS Build (cloud)
eas build --platform android --profile preview

# Ou build local
expo prebuild
npx react-native run-android --mode=release
```

### Release GitHub

1. Builder l'APK avec EAS
2. Télécharger l'APK depuis le dashboard Expo
3. Créer une release sur GitHub : `v1.0.0`
4. Uploader l'APK dans les assets de la release
5. Rédiger les notes de version (changelog)

---
