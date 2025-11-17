# Cahier des charges - Lockup

## 📋 Résumé du projet

**Lockup** est un gestionnaire de mots de passe **standalone pour Android**. L'utilisateur configure lors du premier démarrage, qui lui permet ensuite de déverrouiller son coffre-fort de mots de passe chiffrés.

---

## 🎯 Objectifs par version

### Version 1.0 - MVP Standalone

| Fonctionnalité | Description |
|:--------------|:-----------|
| **Configuration initiale** | Définir un mot de passe maître |
| **Déverrouillage** | Saisir le mot de passe maître pour accéder au coffre |
| **Ajouter un mot de passe** | Stocker pseudo + URL + mot de passe chiffré |
| **Lister les mots de passe** | Afficher tous les mots de passe déchiffrés |
| **Stocker les mots de passe** | Stocker les mots de passe dans un Sqlite |
| **Chiffrement AES-256** | Chiffrer automatiquement avec le code secret |
| **Fermeture de l'app sécurisée** | Redemande le mot de passe maître lorsque l'app est fermée |  

**Technologies V1** :

- Stockage : Sqlite
- Chiffrement : crypto-js (AES-256)

---

### Version 2.0 - Amélioration et performance

| Fonctionnalité | Description |
|:--------------|:-----------|
| **Migration** | Charger un nouveau script avec le nouveau schéma |
| **Indicateur mot de passe maître** | Indiquer laa résistance du mot de passe maître |
| **Modification** | Éditer un mot de passe existant |
| **Suppression** | Supprimer une entrée du coffre |
| **Masquer mot de passe** | Afficher ou masquer les mots de passes du listing | 

**Technologies V2** :

## Déploiement

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
