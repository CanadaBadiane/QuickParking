# QuickParking

Application web transactionnelle de gestion de stationnement à Montréal avec système de réservation et paiement en ligne.

## Table des matières

- [Description](#-description)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API Routes](#-api-routes)
- [Base de données](#-base-de-données)
- [Déploiement](#-déploiement)
- [Auteur](#-auteur)

## Description

QuickParking est une plateforme moderne de gestion de places de stationnement payantes à Montréal. L'application permet aux utilisateurs de :

- Rechercher et visualiser les places de stationnement disponibles
- Réserver des places de stationnement en temps réel
- Effectuer des paiements sécurisés via Stripe
- Gérer leur profil et historique de réservations

Les administrateurs peuvent gérer l'ensemble du système (utilisateurs, parkings, réservations, paiements).

## Fonctionnalités

### Pour les utilisateurs

- Authentification sécurisée avec Clerk
- Visualisation des places de stationnement disponibles
- Système de réservation en temps réel
- Paiements sécurisés avec Stripe
- Historique des réservations et paiements
- Gestion du profil utilisateur

### Pour les administrateurs

- Gestion complète des utilisateurs
- Gestion des places de stationnement
- Suivi des réservations
- Gestion des paiements
- Dashboard administrateur

## Technologies utilisées

### Frontend

- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS

### Backend

- **Next.js API Routes** - API REST
- **Prisma** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **Neon** - Hébergement PostgreSQL serverless

### Services externes

- **Clerk** - Authentification et gestion des utilisateurs
- **Stripe** - Traitement des paiements
- **Stripe Webhooks** - Gestion des événements de paiement

### Outils de développement

- **ESLint** - Linting
- **PostCSS** - Transformation CSS
- **tsx** - Exécution TypeScript
- **bcrypt** - Hashing de mots de passe

## Prérequis

- Node.js (version 20 ou supérieure)
- npm ou yarn
- PostgreSQL (ou compte Neon)
- Compte Clerk
- Compte Stripe

## Installation

1. **Cloner le repository**

```bash
git clone https://github.com/CanadaBadiane/QuickParking.git
cd quickparking
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer la base de données**

```bash
# Générer le client Prisma
npx prisma generate

# Importer les données de parking
npx tsx scripts/importParkingSpot.ts
```

## Configuration

Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Utilisation

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Production

```bash
npm run build
npm start
```

### Autres commandes

```bash
# Linting
npm run lint

# Vider la base de données
npx prisma migrate reset

# Exécuter les migrations
npx prisma migrate dev
```

## Structure du projet

```
quickparking/
├── app/                          # App Router Next.js
│   ├── api/                      # API Routes
│   │   ├── paiements/           # Endpoints paiements
│   │   ├── parking-spots/       # Endpoints parkings
│   │   ├── reservations/        # Endpoints réservations
│   │   ├── stripe/              # Webhooks Stripe
│   │   └── users/               # Endpoints utilisateurs
│   ├── components/              # Composants réutilisables
│   ├── allPaiements/            # Page admin paiements
│   ├── allParkings/             # Page admin parkings
│   ├── allReservations/         # Page admin réservations
│   ├── allUsers/                # Page admin utilisateurs
│   ├── connexion/               # Page connexion
│   ├── inscription/             # Page inscription
│   ├── paiements/               # Page paiements
│   ├── reservation/             # Page réservation
│   ├── userProfile/             # Page profil utilisateur
│   └── ...                      # Autres pages
├── lib/                         # Bibliothèques et utilitaires
│   ├── prisma.ts               # Client Prisma
│   ├── types.ts                # Types TypeScript
│   └── generated/              # Prisma généré
├── prisma/                      # Configuration Prisma
│   ├── schema.prisma           # Schéma de base de données
│   └── migrations/             # Migrations
├── postman/                     # Collection Postman
├── scripts/                     # Scripts utilitaires
└── docs/                        # Documentation
```

## API Routes

### Utilisateurs (`/api/users`)

- `POST /api/users` - Créer un utilisateur
- `GET /api/users/[id]` - Obtenir un utilisateur
- `PATCH /api/users/[id]` - Mettre à jour un utilisateur
- `DELETE /api/users/[id]` - Supprimer un utilisateur (soft delete)
- `POST /api/users/login` - Connexion
- `GET /api/users/dashboard` - Lister tous les utilisateurs (admin)

### Places de stationnement (`/api/parking-spots`)

- `GET /api/parking-spots` - Liste toutes les places
- `GET /api/parking-spots/[id]` - Obtenir une place

### Réservations (`/api/reservations`)

- `GET /api/reservations` - Liste toutes les réservations d'un utilisateur
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations/[id]` - Obtenir une réservation
- `PATCH /api/reservations/[id]` - Mettre à jour une réservation
- `GET /api/reservations/dashboard` - Liste toutes les réservations (admin)

### Paiements (`/api/paiements`)

- `GET /api/paiements` - Liste tous les paiements d'un utilisateur
- `POST /api/paiements` - Créer un paiement
- `GET /api/paiements/[id]` - Obtenir un paiement
- `GET /api/paiements/dashboard` - Liste tous les paiements (admin)

### Stripe (`/api/stripe`)

- `POST /api/stripe/webhook` - Webhook Stripe

## Base de données

### Modèles Prisma

#### User

```prisma
model User {
  userId               String @id @default(cuid())
  clerkId              String @unique
  name                 String
  email                String @unique
  phone                String?
  role                 String @default("user")
  password             String
  confirmationPassword String
  createdAt            DateTime @default(now())
  deletedAt            DateTime?
}
```

#### ParkingSpot

```prisma
model ParkingSpot {
  parkingSpotId   String @id @default(cuid())
  name            String
  description     String
  lat             Float
  lng             Float
  arrondissement  String
  pricePerHour    Float
  isAvailable     Boolean
  canReserve      Boolean
  maxDuration     Int @default(120)
  features        String[]
  lastUpdated     String
}
```

#### Reservation

```prisma
model Reservation {
  reservationId   String @id @default(cuid())
  userId          String
  parkingSpotId   String
  startDateTime   DateTime @default(now())
  endDateTime     DateTime
  extraMinutes    String?
  status          ReservationStatus
  createdAt       DateTime @default(now())
  updatedAt       DateTime
}

enum ReservationStatus {
  active
  completed
  cancelled
}
```

#### Paiement

```prisma
model Paiement {
  paiementId            String @id @default(cuid())
  clerkId               String
  userId                String
  parkingSpotId         String
  reservationId         String?
  stripePaymentIntentId String?
  amount                Float
  duration              Int
  method                String @default("card")
  status                PaiementStatus
  startDateTime         DateTime?
  endDateTime           DateTime?
  createdAt             DateTime @default(now())
}

enum PaiementStatus {
  pending
  completed
  failed
}
```

## Déploiement

### Vercel (recommandé)

1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement requises

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Tests

La collection Postman est disponible dans `postman/QuickParking.postman_collection.json` pour tester tous les endpoints de l'API.

## Notes importantes

- Les mots de passe sont hashés avec bcrypt
- L'authentification utilise Clerk avec JWT tokens
- Les paiements sont sécurisés via Stripe
- Soft delete pour les utilisateurs (deletedAt)
- Mise à jour automatique du statut des réservations expirées
- Support des réservations avec durée maximale configurable

## Auteur

**Canada Badiane**

- GitHub: [@CanadaBadiane](https://github.com/CanadaBadiane)

## Licence

Ce projet a été développé dans le cadre d'un cours d'applications web transactionnelles.

---
