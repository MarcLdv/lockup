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

## Choix de l'algorithme de hachage pour Lockup

En prenant en compte l'importance de la sécurité et de la confidentialité pour les données de notre application, nous avons cherché à utiliser la meilleure méthode de hachage. Pour cela, nous avons pris en compte les exigences spécifiques du cas d'utilisation : le nombre d'utilisateurs, les ressources informatiques disponibles et les exigences de sécurité.

**Pourquoi Argon2 est le meilleur choix :**

Les algorithmes plus récents comme **Argon2 sont considérés comme plus puissants** que les plus anciens comme bcrypt et PBKDF2. Argon2 est conçu pour nécessiter beaucoup de mémoire (memory-hard), ce qui rend difficile pour les attaquants d'utiliser du matériel spécialisé comme les GPU et les ASIC pour casser les mots de passe. Bien que son calcul nécessite plus de mémoire ou de puissance de traitement, cette caractéristique constitue précisément sa force principale contre les attaques par force brute modernes.

Argon2 offre plusieurs paramètres configurables (quantité de mémoire, nombre d'itérations, parallélisme) permettant d'adapter le niveau de sécurité aux ressources disponibles. C'est actuellement l'algorithme de hachage de mot de passe le plus recommandé pour les nouveaux projets.

**Rappel important :** Le hachage des mots de passe n'est qu'un aspect de la sécurité globale. D'autres mesures telles que les politiques de mots de passe robustes et l'authentification multifacteur doivent être utilisées en complément pour maximiser la sécurité.
