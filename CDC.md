# Cahier des charges de Lockup - Gestionnaire de mots de passe

## Résumé des fonctionnalités par version

### Version 1.0 - MVP Fonctionnel

| Fonctionnalité | Description | Priorité |
|:--------------|:-----------|:--------:|
| Inscription | Créer un compte avec email/password | **Haute** |
| Connexion | Se connecter avec JWT | **Haute** |
| Ajouter un mot de passe | Stocker un mot de passe chiffré | **Haute** |
| Lister les mots de passe | Afficher les entrées du coffre | **Haute** |
| Chiffrement basique | crypto-js AES côté client | **Haute** |

**Objectif V1** : Application qui fonctionne de bout en bout

---

### Version 2.0 - Amélioration sécurité

| Fonctionnalité | Description | Priorité |
|:--------------|:-----------|:--------:|
| Générateur de mot de passe | Créer des mots de passe forts | **Haute** |
| Masquage/Affichage | Toggle pour afficher/masquer les MDP | **Haute** |
| Modification | Éditer un mot de passe existant | **Moyenne** |
| Suppression | Supprimer une entrée | **Moyenne** |
| Amélioration UI | Meilleur design et UX | **Moyenne** |

**Objectif V2** : Fonctionnalités utilisables

## Technologies choisies

| Côté | Stack |
|:-----|:------|
| **Frontend** | React Native + Expo, TypeScript, crypto-js, expo-secure-store |
| **Backend** | Node.js + Express, argon2, jsonwebtoken |
| **Base de données** | PostgreSQL |

## Schéma de base de données

Table: users

| Colonne | Type | Contraintes / Notes |
|:-------|:-----|:--------------------|
| id | SERIAL / INTEGER | PRIMARY KEY |
| email | TEXT | UNIQUE NOT NULL |
| password_hash | TEXT | Hash (argon2/bcrypt) pour l'auth |
| created_at | TIMESTAMP | DEFAULT NOW() |

Table: vault_items

| Colonne | Type | Contraintes / Notes |
|:-------|:-----|:--------------------|
| id | SERIAL / INTEGER | PRIMARY KEY |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE |
| title | TEXT | Nom de l'entrée (ex: 'Gmail') |
| login | TEXT | Identifiant associé (email/username) |
| url | TEXT | Lien vers le site web du mot passe enregistré |
| encrypted_value | TEXT | Valeur chiffrée (AES-GCM / libsodium) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

## Architecture du projet

```
lockup/
├── app/                          # ÉCRANS
│   ├── (auth)/                   # Groupe : Authentification
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Groupe : Navigation avec tabs
│   │   ├── index.tsx             # Accueil
│   │   ├── vault.tsx             # Liste des mots de passe
│   │   └── settings.tsx          
│   ├── password/                 # Section : Gestion des MDP
│   │   └── add.tsx               # Ajouter un mot de passe
│   └── _layout.tsx
│
├── services/                     # SERVICES (API, Crypto, Storage)
│   ├── api/                      
│   │   ├── client.ts             # Client HTTP (apiFetch)
│   │   ├── auth.service.ts       # Login, register, logout
│   │   └── vault.service.ts      # CRUD mots de passe
│   ├── crypto/                   
│   │   ├── encryption.ts         # Chiffrement AES
│   └── storage/                  
│       └── secure-store.ts       # SecureStore wrapper
│
├── types/                        # TYPES TypeScript
│   ├── auth.types.ts
│   └── vault.types.ts
│
├── constants/                    # CONFIGURATION
│   └── config.ts                 # API URL
│
├── assets/                       # RESSOURCES (images, fonts)
│
└── backend/                      # API Node.js/Express
    ├── src/
    │   ├── routes/               # Routes Express
    │   ├── middleware/           # Auth JWT
    │   ├── db/                   # PostgreSQL
    │   └── config/               # Configuration
    └── index.js
```

## Choix de l'algorithme de hachage pour Lockup

En prenant en compte l'importance de la sécurité et de la confidentialité pour les données de notre application, nous avons cherché à utiliser la meilleure méthode de hachage. Pour cela, nous avons pris en compte les exigences spécifiques du cas d'utilisation : le nombre d'utilisateurs, les ressources informatiques disponibles et les exigences de sécurité.

**Pourquoi Argon2 est le meilleur choix :**

Les algorithmes plus récents comme **Argon2 sont considérés comme plus puissants** que les plus anciens comme bcrypt et PBKDF2. Argon2 est conçu pour nécessiter beaucoup de mémoire (memory-hard), ce qui rend difficile pour les attaquants d'utiliser du matériel spécialisé comme les GPU et les ASIC pour casser les mots de passe. Bien que son calcul nécessite plus de mémoire ou de puissance de traitement, cette caractéristique constitue précisément sa force principale contre les attaques par force brute modernes.

Argon2 offre plusieurs paramètres configurables (quantité de mémoire, nombre d'itérations, parallélisme) permettant d'adapter le niveau de sécurité aux ressources disponibles. C'est actuellement l'algorithme de hachage de mot de passe le plus recommandé pour les nouveaux projets.

**Rappel important :** Le hachage des mots de passe n'est qu'un aspect de la sécurité globale. D'autres mesures telles que les politiques de mots de passe robustes et l'authentification multifacteur doivent être utilisées en complément pour maximiser la sécurité.
