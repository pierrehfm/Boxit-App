# Boxit

**Boxit** est une application mobile de gestion de cartons de demenagement. Elle permet d'organiser ses cartons par projet, scanner des QR codes pour identifier rapidement le contenu, et collaborer avec d'autres personnes sur un meme demenagement.

Construite avec **Expo SDK 54**, **React Native 0.81**, **Expo Router** et **Supabase** comme backend.

---

## Table des matieres

- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Schema de la base de donnees](#schema-de-la-base-de-donnees)
- [Seed des donnees](#seed-des-donnees)
- [Ecrans de l'application](#ecrans-de-lapplication)
- [API interne](#api-interne)
- [Etat d'avancement](#etat-davancement)
- [Scripts disponibles](#scripts-disponibles)

---

## Fonctionnalites

- **Authentification** : Inscription / connexion via Supabase Auth (email + mot de passe)
- **Projets** : Creation et gestion de projets de demenagement
- **Cartons** : Creation de cartons avec nom, piece, couleur, statut (filling / sealed / unpacked)
- **Objets** : Ajout d'objets dans les cartons avec nom, quantite, description
- **Scanner QR** : Scan de QR codes via la camera pour identifier un carton ou en creer un nouveau
- **Recherche** : Recherche d'objets et de cartons
- **Collaboration** : Ajout de collaborateurs par email avec roles (owner / editor / viewer)
- **Dashboard projet** : Vue d'ensemble avec statistiques, progression par piece, equipe
- **Profil utilisateur** : Edition du profil, avatar, parametres
- **Notifications** : Ecran de notifications (UI en place, donnees mock)
- **Theme sombre** : Support du dark mode via `useColorScheme`

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | [Expo SDK 54](https://expo.dev/) |
| Runtime | [React Native 0.81](https://reactnative.dev/) (New Architecture) |
| Navigation | [Expo Router v6](https://docs.expo.dev/router/introduction/) (file-based routing) |
| Backend | [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage) |
| Langage | TypeScript 5.9 |
| Polices | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) |
| Icones | `@expo/vector-icons` (Feather, MaterialCommunityIcons) |
| Camera | `expo-camera` |
| Images | `expo-image`, `expo-image-picker` |
| Animations | `react-native-reanimated` |
| Gestures | `react-native-gesture-handler` |
| SVG | `react-native-svg` + `react-native-svg-transformer` |
| Storage local | `@react-native-async-storage/async-storage` |
| Dates | `date-fns` |

---

## Architecture du projet

```
Boxit-App/
├── app/                        # Ecrans (file-based routing)
│   ├── (tabs)/                 # Onglets principaux (bottom tabs)
│   │   ├── _layout.tsx         # Configuration des onglets
│   │   ├── index.tsx           # Accueil / Dashboard
│   │   ├── cartons.tsx         # Liste des cartons
│   │   ├── scan.tsx            # Scanner QR
│   │   ├── recherche.tsx       # Recherche
│   │   └── compte.tsx          # Profil utilisateur
│   ├── _layout.tsx             # Layout racine (auth guard, fonts, theme)
│   ├── start.tsx               # Ecran d'accueil (onboarding)
│   ├── login.tsx               # Connexion
│   ├── signup.tsx              # Inscription
│   ├── new-box.tsx             # Creer un carton
│   ├── box-detail.tsx          # Detail d'un carton
│   ├── add-item.tsx            # Ajouter un objet
│   ├── update-status.tsx       # Modifier le statut d'un carton
│   ├── settings.tsx            # Parametres
│   ├── project-dashboard.tsx   # Dashboard projet
│   ├── collaborators.tsx       # Gestion des collaborateurs
│   ├── notifications.tsx       # Notifications
│   ├── edit-profile.tsx        # Modifier le profil
│   └── modal.tsx               # Modal generique
├── components/                 # Composants reutilisables
│   ├── ui/                     # Composants UI de base
│   ├── themed-text.tsx         # Texte avec theme
│   ├── themed-view.tsx         # Vue avec theme
│   ├── haptic-tab.tsx          # Bouton tab avec retour haptique
│   └── ...
├── constants/
│   └── theme.ts                # Couleurs et polices
├── context/
│   └── AuthContext.tsx          # Contexte d'authentification Supabase
├── hooks/                      # Hooks personnalises
│   ├── use-color-scheme.ts     # Detection du theme
│   └── use-theme-color.ts      # Couleur selon le theme
├── lib/
│   ├── supabase.ts             # Client Supabase
│   └── api.ts                  # Fonctions API (couche d'abstraction)
├── assets/
│   └── images/                 # Logo, icones, splash screen
├── scripts/
│   └── reset-project.js        # Script de reset Expo
├── app.json                    # Configuration Expo
├── metro.config.js             # Config Metro (SVG transformer)
├── tsconfig.json               # Config TypeScript
└── package.json
```

---

## Installation

### Prerequis

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo`)
- [Expo Go](https://expo.dev/go) sur votre telephone ou un emulateur iOS/Android
- Un projet [Supabase](https://supabase.com/) configure (voir section base de donnees)

### Etapes

```bash
# 1. Cloner le depot
git clone <repo-url>
cd Boxit-App

# 2. Installer les dependances
npm install

# 3. Configurer les variables d'environnement
cp .env.dist .env
# Editer .env avec vos identifiants Supabase

# 4. (Optionnel) Seeder la base de donnees
node scripts/seed.js

# 5. Lancer l'application
npx expo start
```

---

## Variables d'environnement

Copier `.env.dist` en `.env` et remplir les valeurs :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

Ces valeurs se trouvent dans votre projet Supabase : **Settings > API**.

---

## Schema de la base de donnees

L'application utilise les tables et vues Supabase suivantes :

### Tables

#### `profiles`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid (PK) | Reference vers `auth.users.id` |
| `full_name` | text | Nom complet |
| `avatar_url` | text | URL ou base64 de l'avatar |
| `email` | text | Email de l'utilisateur |

#### `projects`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid (PK) | Identifiant unique |
| `name` | text | Nom du projet |
| `description` | text? | Description optionnelle |
| `owner_id` | uuid (FK) | Proprietaire du projet |
| `created_at` | timestamptz | Date de creation |

#### `project_members`
| Colonne | Type | Description |
|---------|------|-------------|
| `project_id` | uuid (FK) | Reference vers `projects.id` |
| `user_id` | uuid (FK) | Reference vers `profiles.id` |
| `role` | text | `owner` / `editor` / `viewer` |

#### `boxes`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid (PK) | Identifiant unique |
| `project_id` | uuid (FK) | Reference vers `projects.id` |
| `qr_code` | text | Code QR unique du carton |
| `name` | text | Nom du carton |
| `room` | text? | Piece (Salon, Cuisine, etc.) |
| `color` | text? | Couleur du carton |
| `is_fragile` | boolean | Contenu fragile |
| `status` | text | `filling` / `sealed` / `unpacked` |
| `cover_photo_path` | text? | Photo de couverture |
| `created_at` | timestamptz | Date de creation |
| `updated_at` | timestamptz | Derniere mise a jour |

#### `items`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid (PK) | Identifiant unique |
| `box_id` | uuid (FK) | Reference vers `boxes.id` |
| `name` | text | Nom de l'objet |
| `quantity` | integer | Quantite |
| `description` | text? | Description optionnelle |
| `created_at` | timestamptz | Date de creation |

### Vues

#### `project_stats`
Vue agregee fournissant les statistiques par projet :
- `project_id`, `project_name`, `total_boxes`, `total_items`, `boxes_filling`, `boxes_sealed`, `boxes_unpacked`

---

## Seed des donnees

Un script de seed est disponible pour peupler la base avec des donnees de demonstration. C'est utile pour pouvoir travailler sur le cablage de l'application sans avoir a tout creer manuellement.

```bash
# Prerequis : avoir configure .env avec vos identifiants Supabase
node scripts/seed.js
```

Le script cree :
- **1 utilisateur de test** (via Supabase Auth)
- **2 projets** de demenagement
- **Le proprietaire** est ajoute comme membre de chaque projet
- **8 cartons** repartis dans differentes pieces avec differents statuts
- **~20 objets** distribues dans les cartons

Voir `scripts/seed.js` pour les details et la personnalisation des donnees.

---

## Ecrans de l'application

### Authentification

| Ecran | Route | Description |
|-------|-------|-------------|
| Onboarding | `/start` | Ecran d'accueil avec logo et CTA |
| Connexion | `/login` | Formulaire email / mot de passe |
| Inscription | `/signup` | Creation de compte |

### Onglets principaux

| Ecran | Route | Description |
|-------|-------|-------------|
| Accueil | `/(tabs)/` | Dashboard avec stats du projet actif, actions rapides, cartons recents |
| Cartons | `/(tabs)/cartons` | Liste de tous les cartons avec filtres par piece |
| Scanner | `/(tabs)/scan` | Scan QR via camera, identification ou creation de carton |
| Recherche | `/(tabs)/recherche` | Recherche de cartons et objets avec filtres |
| Compte | `/(tabs)/compte` | Profil utilisateur, stats, projets, menu parametres |

### Ecrans secondaires

| Ecran | Route | Description |
|-------|-------|-------------|
| Nouveau carton | `/new-box` | Formulaire de creation d'un carton |
| Detail carton | `/box-detail` | Detail d'un carton avec liste d'objets |
| Ajouter objet | `/add-item` | Formulaire d'ajout d'objet |
| Modifier statut | `/update-status` | Changement de statut d'un carton |
| Dashboard projet | `/project-dashboard` | Vue d'ensemble du projet avec stats et equipe |
| Collaborateurs | `/collaborators` | Gestion des membres du projet |
| Notifications | `/notifications` | Liste des notifications |
| Parametres | `/settings` | Parametres de l'application |
| Modifier profil | `/edit-profile` | Edition du nom et avatar |

---

## API interne

La couche API (`lib/api.ts`) centralise les appels Supabase :

| Fonction | Table/Vue | Description |
|----------|-----------|-------------|
| `getUserProjects()` | `projects` | Liste les projets de l'utilisateur |
| `getProject(id)` | `projects` | Recupere un projet par ID |
| `createProject(name, desc?)` | `projects` | Cree un nouveau projet |
| `getProjectStats(id)` | `project_stats` | Statistiques agregees du projet |
| `getRecentBoxes(projectId?, limit)` | `boxes` + `items` | Cartons recents avec nombre d'objets |
| `getAllBoxes(projectId)` | `boxes` | Tous les cartons d'un projet |
| `getBox(id)` | `boxes` | Recupere un carton par ID |
| `getBoxByQR(qrCode)` | `boxes` | Recherche un carton par QR code |
| `createBox(box)` | `boxes` | Cree un nouveau carton |
| `getBoxItems(boxId)` | `items` | Liste les objets d'un carton |
| `getProjectMembers(projectId)` | `project_members` + `profiles` | Membres du projet avec profils |
| `addProjectMember(projectId, email)` | `profiles` + `project_members` | Ajoute un collaborateur par email |

---

## Etat d'avancement

### Connecte au backend

- [x] Authentification (login / signup / logout)
- [x] Creation de projet
- [x] Affichage des projets et stats
- [x] Creation de cartons
- [x] Detail d'un carton avec objets
- [x] Scanner QR -> identification de carton
- [x] Dashboard projet avec stats par piece
- [x] Gestion des collaborateurs (affichage + invitation)
- [x] Edition de profil (nom + avatar)

### UI en place, pas encore cable

- [ ] Liste des cartons (`/(tabs)/cartons`) — utilise des donnees mock
- [ ] Recherche (`/(tabs)/recherche`) — utilise des donnees mock
- [ ] Ajout d'objet (`/add-item`) — formulaire present, pas de sauvegarde
- [ ] Modification de statut (`/update-status`) — UI presente, pas de sauvegarde
- [ ] Notifications (`/notifications`) — donnees mock
- [ ] Stats du profil (`/(tabs)/compte`) — valeurs en dur

### Fonctions API manquantes dans `lib/api.ts`

- `createItem(item)` — inserer un objet dans un carton
- `updateBoxStatus(boxId, status)` — modifier le statut d'un carton
- `searchBoxes(query)` / `searchItems(query)` — recherche textuelle
- `getNotifications()` — table de notifications a creer

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lancer le serveur Expo |
| `npm run android` | Lancer sur Android |
| `npm run ios` | Lancer sur iOS |
| `npm run web` | Lancer en mode web |
| `npm run lint` | Linter le code |
| `npm run reset-project` | Remettre le projet a zero (Expo) |
| `node scripts/seed.js` | Peupler la base avec des donnees de demo |

---

## Licence

Projet prive — usage educatif.
