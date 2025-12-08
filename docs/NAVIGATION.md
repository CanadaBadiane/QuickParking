# Guide de navigation - QuickParking

Guide d'utilisation de la plateforme QuickParking pour les utilisateurs.

## Table des matières

- [Connexion et accueil](#connexion-et-accueil)
- [Navigation générale](#navigation-générale)
- [Gestion du profil](#gestion-du-profil)
- [Rechercher et consulter les parkings](#rechercher-et-consulter-les-parkings)
- [Créer une réservation](#créer-une-réservation)
- [Effectuer un paiement](#effectuer-un-paiement)
- [Consulter l'historique](#consulter-lhistorique)
- [Règles et contraintes](#règles-et-contraintes)

## Connexion et accueil

### Première connexion

1. Accédez à la plateforme QuickParking
2. Si vous n'avez pas de compte, cliquez sur **"Créer un compte"**
3. Remplissez vos informations (nom, email, téléphone, mot de passe)
4. Une fois inscrit, vous êtes automatiquement connecté

### Page d'accueil

Après connexion, vous arrivez sur votre **tableau de bord** qui affiche 5 options principales :

- **Voir le profil** : Consulter et modifier vos informations personnelles
- **Historique des réservations** : Voir toutes vos réservations passées et actuelles
- **Historique des paiements** : Consulter tous vos paiements effectués
- **Réserver** : Créer une nouvelle réservation de stationnement
- **Payer** : Effectuer un paiement pour une place de parking

## Navigation générale

### Menu principal (Header)

En haut de chaque page, vous trouverez :

- **Logo QuickParking** : Cliquez dessus pour revenir à l'accueil
- **Bouton "Stationnement"** : Accès rapide à la liste de tous les parkings disponibles
- **Bouton de déconnexion** : Pour vous déconnecter de votre compte

### Comment naviguer

La navigation se fait principalement par :

- **Clics sur les boutons** de la page d'accueil
- **Menu du header** pour accéder aux parkings
- **Liens dans les listes** (réservations, paiements, parkings)

## Gestion du profil

### Consulter votre profil

1. Depuis l'accueil, cliquez sur **"Voir le profil"**
2. Vous verrez vos informations :
   - Nom
   - Email
   - Numéro de téléphone
   - Rôle (utilisateur)

### Modifier votre profil

1. Sur la page de profil, cliquez sur **"Modifier"**
2. Modifiez les champs souhaités :
   - Nom
   - Email
   - Téléphone
3. Cliquez sur **"Enregistrer"** pour sauvegarder

### Supprimer votre compte

1. Sur la page de profil, cliquez sur **"Supprimer le compte"**
2. Confirmez votre choix
3. **Note** : La suppression est "soft", vos données sont archivées mais vous ne pourrez plus vous connecter

## Rechercher et consulter les parkings

### Accéder à la liste des parkings

1. Cliquez sur **"Stationnement"** dans le header
2. Vous verrez tous les parkings de Montréal

### Filtrer les parkings

Sur la page des parkings, vous pouvez filtrer par :

- **Tous** : Affiche tous les parkings
- **Disponibles** : Seulement les parkings disponibles
- **Indisponibles** : Parkings actuellement occupés

### Consulter un parking

1. Cliquez sur un parking dans la liste
2. Vous verrez les détails :
   - Nom et description
   - Localisation (arrondissement, coordonnées GPS)
   - Prix par heure
   - Durée maximale de stationnement
   - Disponibilité actuelle
   - Caractéristiques (fonctionnalités spéciales)

### Actions depuis un parking

Depuis la page d'un parking, vous pouvez :

- **Réserver maintenant** : Crée une réservation pour ce parking
- **Payer maintenant** : Effectue un paiement pour ce parking
- **Obtenir l'itinéraire** : Ouvre Google Maps pour vous guider vers le parking

## Créer une réservation

### Processus de réservation

#### Option 1 : Depuis l'accueil

1. Cliquez sur **"Réserver"** depuis l'accueil
2. Entrez le id du parking souhaité
3. Choisissez la durée de réservation (en minutes)
4. Cliquez sur **"Réserver"**

#### Option 2 : Depuis un parking

1. Consultez un parking spécifique
2. Cliquez sur **"Réserver"**
3. Le parking est automatiquement pré-sélectionné
4. Choisissez la durée
5. Validez la réservation

### Informations de réservation

Lors d'une réservation, vous définissez :

- **Parking** : Le parking que vous souhaitez réserver
- **Durée** : Combien de temps vous voulez réserver (en minutes)
- **Début** : La réservation commence immédiatement
- **Fin** : Calculée automatiquement selon la durée choisie

### Après la réservation

1. Vous recevez une confirmation
2. Vous êtes redirigé vers la page de **détails de la réservation**
3. Vous pouvez voir :
   - Numéro de réservation
   - Parking réservé
   - Dates et heures (début et fin)
   - Statut de la réservation

### Règles des réservations

- **Une seule réservation active** par utilisateur à la fois
- **Durée maximale** : Respecte la durée max de réservation (15 minutes)
- **Disponibilité** : Le parking doit être disponible
- **Statuts possibles** :
  - **Active** : Réservation en cours
  - **Completed** : Réservation terminée
  - **Cancelled** : Réservation annulée

### Modifier une réservation

1. Allez dans **"Historique des réservations"**
2. Cliquez sur la réservation à modifier
3. Sur la page de détails :
   - Modifiez la date de fin si nécessaire
   - Changez le statut si besoin
4. Cliquez sur **"Mettre à jour"**

### Annuler une réservation

1. Accédez aux détails de la réservation
2. Changez le statut à **"Annulée"**
3. Confirmez la modification

## Effectuer un paiement

### Processus de paiement

#### Option 1 : Depuis l'accueil

1. Cliquez sur **"Payer"** depuis l'accueil
2. Entrez le parking (en saisissant son ID)
3. Choisissez la durée de stationnement (en minutes)
4. Le montant est calculé automatiquement : **Prix/heure × (durée/60)**
5. Cliquez sur **"Créer le paiement"**

#### Option 2 : Depuis un parking

1. Consultez un parking spécifique
2. Cliquez sur **"Payer"**
3. Le parking est pré-sélectionné
4. Choisissez la durée
5. Passez au paiement

### Page de paiement Stripe

1. Vous êtes redirigé vers le formulaire de paiement sécurisé
2. Entrez vos informations de carte bancaire :
   - Numéro de carte
   - Date d'expiration
   - CVC
3. Cliquez sur **"Payer"**

### Confirmation de paiement

1. Si le paiement réussit, vous voyez la page de **succès**
2. Un message confirme que le paiement est complété
3. Vous pouvez :
   - **Voir les détails** : Consulter le paiement dans votre profil
   - **Retour à l'accueil** : Revenir au tableau de bord

### Informations de paiement

Un paiement contient :

- **Parking** : Le parking pour lequel vous payez
- **Durée** : Temps de stationnement (en minutes)
- **Montant** : Calculé selon le tarif horaire
- **Méthode** : Carte bancaire (Stripe)
- **Dates** : Début et fin du stationnement
- **Statut** : pending (en attente), completed (complété), failed (échoué)

### Règles des paiements

- **Temps minimum** : Le temps minimal est de 10 minutes
- **Durée maximum** : Respecte la durée max du parking
- **Paiement sécurisé** : Tous les paiements passent par Stripe
- **Confirmation instantanée** : Le statut passe à "completed" après succès
- **Lien avec réservation** : Un paiement peut être lié à une réservation

### Que faire si le paiement échoue ?

1. Vérifiez vos informations bancaires
2. Assurez-vous d'avoir suffisamment de fonds
3. Réessayez le paiement
4. Si le problème persiste, contactez votre banque

## Consulter l'historique

### Historique des réservations

1. Depuis l'accueil, cliquez sur **"Historique des réservations"**
2. Vous verrez la liste de toutes vos réservations

**Actions** :

- Cliquez sur une réservation pour voir ses détails complets
- Modifiez ou annulez une réservation depuis sa page de détails

### Historique des paiements

1. Depuis l'accueil, cliquez sur **"Historique des paiements"**
2. Vous verrez la liste de tous vos paiements

**Actions** :

- Cliquez sur un paiement pour voir ses détails complets
- Consultez le montant, la durée, et le parking associé

## Règles et contraintes

### Disponibilité des parkings

Un parking est **indisponible** si :

- Une réservation active existe pour ce parking
- Un paiement "pending" est en attente pour ce parking
- Un paiement est en cours d'utilisation (completed)
- Le parking a été marqué manuellement comme indisponible

### Réservations automatiques

- Les réservations expirent automatiquement à la date de fin
- Le statut passe de "active" à "completed" automatiquement
- Vous ne pouvez avoir qu'**une seule réservation active** à la fois

### Calcul des montants

Le montant d'un paiement est calculé ainsi :

```
Montant = Prix par heure × (Durée en minutes ÷ 60)
```

**Exemple** :

- Prix : 5$/heure
- Durée : 90 minutes
- Montant = 5 × (90 ÷ 60) = 7.50$

### Durée maximale

Chaque parking a une **durée maximale** de stationnement (généralement 120 minutes). Vous ne pouvez pas :

- Payer pour plus longtemps que cette durée

### Validation des données

Lors d'une réservation ou d'un paiement :

- Le **parking doit exister** dans le système
- Le **parking doit être disponible**
- La **durée doit être valide** (positive, au dessus du minimum ou égal et sous le maximum)
- Vous devez être **authentifié**

### Statut des réservations

- **Active** : La réservation est en cours, vous pouvez l'utiliser
- **Completed** : La réservation est terminée (date de fin dépassée)
- **Cancelled** : Vous avez annulé la réservation

### Statut des paiements

- **Pending** : Le paiement est en cours de traitement
- **Completed** : Le paiement a été accepté et traité avec succès
- **Failed** : Le paiement a échoué (carte refusée, fonds insuffisants, etc.)

---
