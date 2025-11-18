# Cahier des charges - Lockup

## Version 1.0

### Fonctionnalités

| Fonctionnalité | Description |
|:--------------|:-----------|
| Configuration initiale | Définir un mot de passe maître (minimum 4 caractères) |
| Déverrouillage | Saisir le mot de passe maître pour accéder au coffre |
| Ajouter un mot de passe | Stocker pseudo + URL + mot de passe chiffré |
| Lister les mots de passe | Afficher tous les mots de passe déchiffrés dans le coffre |
| Chiffrement AES-256 | Chiffrer automatiquement chaque entrée avec le mot de passe maître |
| Verrouillage sécurisé | Redemander le mot de passe maître lors de la fermeture ou du verrouillage manuel |

### Architecture de sécurité V1

- Mot de passe maître stocké en clair dans SecureStore (Android Keystore)
- Hash PBKDF2 avec 10 000 itérations pour l'authentication
- Chiffrement AES-256-CBC avec IV unique (16 bytes) par entrée
- Salt unique généré à la configuration (32 bytes)
- Base de données SQLite locale

## Version 2.0

### Nouvelles fonctionnalités

| Fonctionnalité | Description |
|:--------------|:-----------|
| Migration automatique | Détection de V1 et réinitialisation de la base de données |
| Indicateur de force | Barre de progression colorée indiquant la robustesse du mot de passe maître (Faible/Moyen/Bon/Fort) |
| Modification | Éditer le pseudo, l'URL ou le mot de passe d'une entrée existante |
| Suppression | Supprimer une entrée du coffre avec dialogue de confirmation |
| Masquage | Basculer l'affichage entre texte clair et points noirs (••••••••) pour chaque mot de passe |

### Architecture de sécurité V2

- Clé de chiffrement dérivée stockée uniquement en RAM (variable `encryptionKeyInMemory`)
- Disparition automatique de la clé au verrouillage via `lockApp()`
- Double dérivation PBKDF2 :
  - Salt 1 (32 bytes) : hash du mot de passe maître pour authentication
  - Salt 2 (32 bytes) : dérivation de la clé de chiffrement AES
- Salts séparés stockés dans SecureStore mais mot de passe maître jamais persisté

### Breaking change V1 → V2

**Raison** : Passage d'un stockage persistant du mot de passe maître (V1) à une clé dérivée volatile en RAM (V2).

**Impact** : Impossible de déchiffrer les anciennes entrées V1 sans le mot de passe en clair. La migration force une réinitialisation complète de la base de données (DROP TABLE + CREATE TABLE).

**Comportement** : Au lancement de l'app V2, si `db_version = 1` est détecté, la fonction `migrateToV2()` supprime toutes les données et recrée les tables vides.

## Comparaison V1 vs V2

| Aspect | Version 1.0 | Version 2.0 |
|:-------|:-----------|:-----------|
| Stockage mot de passe maître | SecureStore (clair) | RAM uniquement (dérivé) |
| Sécurité au repos | Keystore Android | Aucune persistance |
| Modification d'entrée | Non | Oui |
| Suppression d'entrée | Non (reset complet uniquement) | Oui (individuelle) |
| Masquage mot de passe | Non (toujours visible) | Oui (toggle par entrée) |
| Indicateur de force | Non | Oui |
| Migration de données | N/A | Impossible (reset requis) |
