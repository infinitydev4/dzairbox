# DzBusiness - Plateforme de Services Locaux en Algérie

Une application PWA développée avec Next.js pour permettre aux entreprises et commerçants locaux d'Algérie de s'inscrire et d'obtenir une visibilité en ligne via une page d'atterrissage dédiée hébergée sur un sous-domaine de notre application.

## 🚀 Fonctionnalités

- **Inscription intelligente** : Chatbot IA qui guide les utilisateurs dans le processus d'inscription
- **Authentification** : Système d'authentification avec rôles (USER/ADMIN)
- **PWA** : Application Web Progressive optimisée pour mobile
- **Multilingue** : Support français et arabe
- **SEO local** : Optimisé pour le référencement local en Algérie
- **Dashboard** : Interface de gestion pour les entreprises
- **Panel d'administration** : Gestion complète pour les administrateurs

## 🛠️ Technologies utilisées

- Next.js 14
- NextAuth.js pour l'authentification
- Prisma ORM avec SQLite
- Tailwind CSS
- TypeScript
- OpenAI API pour le chatbot
- Lucide React pour les icônes

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd dzairbox
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet :
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **Initialiser la base de données**
   ```bash
   npm run setup
   ```
   Cette commande va :
   - Générer le client Prisma
   - Créer la base de données
   - Créer un utilisateur administrateur par défaut

5. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Accéder à l'application**
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

## 👤 Compte administrateur par défaut

Après avoir exécuté `npm run setup`, un compte administrateur sera créé :
- **Email** : admin@dzbusiness.dz
- **Mot de passe** : admin123

⚠️ **Important** : Changez ce mot de passe après votre première connexion !

## 🏗️ Structure du projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── admin/             # Panel d'administration
│   ├── dashboard/         # Dashboard utilisateur
│   └── register/          # Page d'inscription entreprise
├── components/            # Composants React réutilisables
│   ├── auth/             # Composants d'authentification
│   └── ui/               # Composants UI de base
├── lib/                  # Utilitaires et configurations
├── prisma/               # Schéma de base de données
├── scripts/              # Scripts d'initialisation
└── types/                # Types TypeScript
```

## 🔑 Authentification et rôles

### Rôles disponibles :
- **USER** : Utilisateur standard (peut créer et gérer ses entreprises)
- **ADMIN** : Administrateur (accès complet au système)

### Routes protégées :
- `/dashboard/*` : Accessible aux utilisateurs connectés
- `/admin/*` : Accessible uniquement aux administrateurs

## 📚 API Routes

### Authentification
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `/api/auth/[...nextauth]` - Endpoints NextAuth.js

### Administration (ADMIN uniquement)
- `GET /api/admin/stats` - Statistiques du système
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/businesses` - Liste des entreprises

## 🎨 Thèmes et langues

L'application supporte :
- **Thèmes** : Clair/Sombre (configuré avec next-themes)
- **Langues** : Français et Arabe

## 📱 PWA

L'application est configurée comme une PWA avec :
- Manifest personnalisé
- Support offline (service worker)
- Installation sur mobile/desktop

## 🚀 Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Démarrer en production**
   ```bash
   npm start
   ```

## 🔧 Scripts utiles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Build de production
- `npm run start` - Démarrer en production
- `npm run lint` - Linter le code
- `npm run db:init` - Initialiser la base de données
- `npm run db:seed` - Créer l'utilisateur admin
- `npm run setup` - Configuration complète (db + admin)

## 📄 Licence

Ce projet est sous licence privée.
