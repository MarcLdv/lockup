# 🎯 Guide Versioning Git - Lockup (Projet Dev Natif)

## 📋 Plan de versioning pour Lockup

### **Version 1.0.0** - MVP Sécurisé

**Date cible** : 17/11/2025  
**Tag Git** : `v1.0.0`  
**Branch** : `release/v1.0.0`

**Fonctionnalités** :

| ID | Fonctionnalité | Priorité | Statut |
|----|---------------|----------|--------|
| F1 | Inscription utilisateur (email + password) | Haute | ✅ |
| F2 | Connexion avec JWT | Haute | ✅ |
| F3 | Ajouter un mot de passe chiffré (AES) | Haute | ✅ |
| F4 | Lister les mots de passe stockés | Haute | ✅ |
| F5 | Déchiffrement et affichage des MDP | Haute | ✅ |
| F6 | Déconnexion | Moyenne | ✅ |

**Technos V1** :

- Frontend : React Native + Expo
- Backend : Node.js + Express + PostgreSQL
- Sécurité : Argon2 (auth) + AES (stockage)

---

### **Version 2.0.0** - Gestion Avancée

**Date cible** : 19/11/2025  
**Tag Git** : `v2.0.0`  
**Branch** : `release/v2.0.0`

**Nouvelles fonctionnalités** :

| ID | Fonctionnalité | Priorité | Statut |
|----|---------------|----------|--------|
| F7 | Générateur de mots de passe sécurisés | Haute | 🔄 |
| F8 | Édition d'un mot de passe existant | Haute | 🔄 |
| F9 | Suppression d'un mot de passe | Moyenne | 🔄 |
| F10 | Amélioration UI/UX (icônes, animations) | Moyenne | 🔄 |
| F11 | Recherche dans le coffre-fort | Basse | ⏸️ |

**Changements techniques** :

- Ajout de routes backend : `PUT /api/vault/:id`, `DELETE /api/vault/:id`
- Nouveau composant : `PasswordGenerator.tsx`
- Amélioration du layout avec meilleure navigation

**Migration V1 → V2** :

- ✅ **Compatibilité ascendante** : Les données V1 restent valides en V2
- ✅ Pas de migration de base de données nécessaire
- ✅ L'utilisateur peut mettre à jour sans perdre ses mots de passe

---

## 🔧 Workflow Git à suivre

### **Étape 1 : Finaliser V1.0.0**

```bash
# 1. Vérifier que tout fonctionne
npm start  # Frontend
cd backend && npm start  # Backend

# 2. Tester manuellement toutes les features V1
# - Créer un compte
# - Ajouter 3 mots de passe
# - Les afficher
# - Se déconnecter/reconnecter

# 3. Mettre à jour app.json
# Modifier "version": "1.0.0" et "versionCode": 1

# 4. Commit final V1
git add .
git commit -m "🎉 Version 1.0.0 - MVP fonctionnel avec auth + CRUD coffre-fort"

# 5. Créer le tag
git tag -a v1.0.0 -m "Release 1.0.0 - MVP Sécurisé"

# 6. Créer une branche de release
git checkout -b release/v1.0.0

# 7. Push tout
git push origin marc
git push origin release/v1.0.0
git push origin v1.0.0
```

---

### **Étape 2 : Développer V2.0.0**

```bash
# 1. Revenir sur la branche principale
git checkout marc

# 2. Créer une branche feature pour le générateur
git checkout -b feature/password-generator

# 3. Développer le générateur de mots de passe
# - Créer services/crypto/password-gen.ts
# - Créer l'écran de génération
# - Intégrer dans le flow d'ajout de mot de passe

# 4. Commit réguliers pendant le dev
git add services/crypto/password-gen.ts
git commit -m "✨ Ajout du générateur de mots de passe"

# 5. Créer une branche feature pour l'édition
git checkout marc
git checkout -b feature/edit-password

# 6. Développer l'édition
# - Ajouter route backend PUT /api/vault/:id
# - Créer écran d'édition
# - Tester

git add .
git commit -m "✨ Ajout édition et suppression de mots de passe"

# 7. Merger les features dans marc
git checkout marc
git merge feature/password-generator
git merge feature/edit-password

# 8. Mettre à jour app.json pour V2
# Modifier "version": "2.0.0" et "versionCode": 2

# 9. Commit final V2
git add .
git commit -m "🚀 Version 2.0.0 - Générateur + Édition/Suppression"

# 10. Créer le tag V2
git tag -a v2.0.0 -m "Release 2.0.0 - Gestion Avancée"

# 11. Créer branche release V2
git checkout -b release/v2.0.0

# 12. Push tout
git push origin marc
git push origin release/v2.0.0
git push origin v2.0.0
```

---

## 📦 Créer les releases GitHub

### **Pour V1.0.0**

1. Va sur GitHub → **Releases** → **Draft a new release**
2. **Tag** : `v1.0.0`
3. **Title** : `Version 1.0.0 - MVP Sécurisé`
4. **Description** (Release Notes) :

## 🗂️ Structure Git finale attendue

```
Branches :
├── master (ou main)          → Code initial/base
├── marc                      → Branche de développement principale
├── feature/password-generator → Développement générateur
├── feature/edit-password     → Développement édition
├── release/v1.0.0            → Branche figée V1
└── release/v2.0.0            → Branche figée V2

Tags :
├── v1.0.0                    → Release V1
└── v2.0.0                    → Release V2

GitHub Releases :
├── v1.0.0 (avec APK V1)
└── v2.0.0 (avec APK V2)
```

## ✅ Checklist finale avant rendu

### **Git & GitHub**

- [ ] Dépôt public accessible
- [ ] Branches `marc`, `release/v1.0.0`, `release/v2.0.0` créées
- [ ] Tags `v1.0.0` et `v2.0.0` créés
- [ ] Historique de commits propre (messages clairs)
- [ ] GitHub Releases créées avec APK

### **Documentation**

- [ ] README.md à jour avec instructions d'installation
- [ ] CDC.md avec planning des versions
- [ ] Release notes pour V1 et V2

### **Code**

- [ ] `app.json` : version 2.0.0, versionCode 2
- [ ] V1 fonctionne (testée sur émulateur)
- [ ] V2 fonctionne (testée sur émulateur)
- [ ] Pas de code cassé dans les branches

### **Livrables**

- [ ] APK V1 généré et uploadé sur GitHub Release
- [ ] APK V2 généré et uploadé sur GitHub Release
- [ ] PDF à déposer sur Teams : `dev_natif_projet_l_marc.pdf` avec lien GitHub

### **Présentation**

- [ ] Slides préparés (optionnel mais conseillé)
- [ ] Émulateur prêt avec V1 et V2 installées
- [ ] Démo répétée (rester sous 8 min)

---

## 🚨 Pièges à éviter

❌ **Ne pas confondre branches et tags** → Branches = évolutives, Tags = figés  
❌ **Ne pas oublier les release notes** → 2 pts faciles à perdre  
❌ **Ne pas faire de merge n'importe comment** → Historique Git doit être lisible  
❌ **Ne pas livrer du code qui ne compile pas** → Tester avant de push  
❌ **Ne pas sous-estimer le temps de build APK** → Prévoir 20-30 min par build  

## 🎯 Résumé : Les 5 étapes critiques

1. **Finaliser V1** → Commit + Tag `v1.0.0` + Branch `release/v1.0.0`
2. **Créer Release GitHub V1** → Avec APK et release notes
3. **Développer V2** → Branches feature + Merge dans `marc`
4. **Finaliser V2** → Commit + Tag `v2.0.0` + Branch `release/v2.0.0`
5. **Créer Release GitHub V2** → Avec APK et release notes
