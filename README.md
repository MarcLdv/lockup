# Lockup - Gestionnaire de mots de passe

## Prérequis

- Node.js
- Docker (pour PostgreSQL)

## Installation et démarrage

### Backend && Base de données

```bash
cd backend
npm install
docker-compose up -d
npm start
```

Le serveur démarre sur `http://localhost:3000`

### Frontend

```bash
npm install
npm start
```

Appuyez sur `a` pour Android ou `i` pour iOS

## Configuration

Le fichier `.env` est déjà configuré. Pour PostgreSQL, les identifiants par défaut sont :

- User: `lockup`
- Password: `pass`
- Database: `lockup`

## API Endpoints

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/vault` - Liste des mots de passe
- `POST /api/vault` - Ajouter un mot de passe
- `PUT /api/vault/:id` - Modifier
- `DELETE /api/vault/:id` - Supprimer