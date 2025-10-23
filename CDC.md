# Cahier des charges de Lockup - Gestionnaire de mots de passe

## Résumé des fonctionnalités par version

| Version | Fonctionnalité | Description | Priorité |
|--------:|:--------------:|:-----------|:--------:|
| V1 | Connexion | Permettre à un utilisateur de se connecter à l'application | Haute |
| V1 | Gestion des mots de passe | Ajouter / stocker des mots de passe chiffrés en base de données | Haute |
| V1 | Méthode de chiffrement | Implémenter un chiffrement fiable pour les mots de passe | Haute |
| V1 | Affichage | Afficher les mots de passe de l'utilisateur connecté | Moyenne |
| V2 | Générateur de mot de passe | Générer des mots de passe sécurisés | Moyenne |
| V2 | Masquage | Cacher par défaut les mots de passe affichés et avoir un reveal sécurisé | Moyenne |
| V2 | Mettre à jour un mot de passe | Permettre de modifier un mot de passe | Moyenne |

## Technologies choisies

| Côté | Rôle | Stack / Notes |
|:-----|:-----|:--------------|
| Client | Interface & chiffrement local | React Native, TypeScript, Web Crypto API / crypto-js, react-native-keychain (KeyStore / Keychain) |
| Backend | API, auth & stockage chiffré | Node.js + Express (ou NestJS), TypeScript, argon2 (hash mot de passe), jsonwebtoken |
| Base de données | Stockage relationnel | PostgreSQL 16+ |

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
