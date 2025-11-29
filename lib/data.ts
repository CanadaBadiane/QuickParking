import { User, Reservation } from "./types";

// Places de stationnement simulées
export const parkingSpots = [
  {
    parkingSpotId: "463543",
    name: "Place 463543",
    address: "Rue A, Montréal",
    description: "Place payante",
    coordinates: { lat: 45.5, lng: -73.6 },
    arrondissement: "Plateau",
    pricePerHour: 3.5,
    isAvailable: true,
    canReserve: true,
    maxDuration: 120,
    features: ["Parcomètre"],
    restrictions: "Lun-Ven 9h-17h",
    nearbyLandmarks: ["Métro"],
    nextAvailable: undefined,
    source: "local",
    lastUpdated: new Date().toISOString(),
  },
  {
    parkingSpotId: "472191",
    name: "Place 472191",
    address: "Rue B, Montréal",
    description: "Place payante",
    coordinates: { lat: 45.51, lng: -73.61 },
    arrondissement: "Rosemont",
    pricePerHour: 3.5,
    isAvailable: true,
    canReserve: true,
    maxDuration: 120,
    features: ["Parcomètre"],
    restrictions: "Lun-Ven 9h-17h",
    nearbyLandmarks: ["Parc"],
    nextAvailable: undefined,
    source: "local",
    lastUpdated: new Date().toISOString(),
  },
];

// Utilisateurs simulés
export const users: User[] = [
  {
    userId: "user-001",
    clerkId: "clerk-001",
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "+1 514 123-4567",
    password: "Coucou76",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    userId: "user-002",
    clerkId: "clerk-002",
    name: "Jean Tremblay",
    email: "jean.tremblay@email.com",
    phone: "+1 514 234-5678",
    password: "Coucou76",
    createdAt: "2024-02-10T14:20:00Z",
  },
  {
    userId: "user-003",
    clerkId: "clerk-003",
    name: "Sophie Martin",
    email: "sophie.martin@email.com",
    password: "Coucou76",
    createdAt: "2024-03-05T09:15:00Z",
  },
];

// Réservations simulées
export const reservations: Reservation[] = [
  {
    reservationId: "res-001",
    userId: "user-001",
    parkingSpotId: "463543", // ID réel de Montréal
    startDateTime: "2025-11-21T09:00:00Z",
    endDateTime: "2025-11-21T09:15:00Z",
    status: "active",
    createdAt: "2025-11-20T08:30:00Z",
    updatedAt: "2025-11-20T08:30:00Z",
  },
  {
    reservationId: "res-002",
    userId: "user-001",
    parkingSpotId: "472191",
    startDateTime: "2025-11-20T14:00:00Z",
    endDateTime: "2025-11-20T14:15:00Z",
    status: "completed",
    createdAt: "2025-11-20T13:45:00Z",
    updatedAt: "2025-11-20T16:05:00Z",
  },
  {
    reservationId: "res-003",
    userId: "user-002",
    parkingSpotId: "502838",
    startDateTime: "2025-11-21T10:30:00Z",
    endDateTime: "2025-11-21T10:45:00Z",
    status: "active",
    createdAt: "2025-11-20T09:15:00Z",
    updatedAt: "2025-11-20T09:15:00Z",
  },
  {
    reservationId: "res-004",
    userId: "user-001",
    parkingSpotId: "624597",
    startDateTime: "2025-11-19T08:00:00Z",
    endDateTime: "2025-11-19T08:15:00Z",
    status: "completed",
    createdAt: "2025-11-19T07:30:00Z",
    updatedAt: "2025-11-19T10:05:00Z",
  },
];

// Paiements simulés
export const paiements = [
  {
    paiementId: "pay_001",
    clerkId: "clerk-001",
    parkingSpotId: "463543",
    reservationId: "res-001",
    amount: 12.5,
    duration: 60,
    method: "credit_card",
    status: "completed",
    createdAt: "2025-11-27T09:00:00.000Z",
  },
  {
    paiementId: "pay_002",
    clerkId: "clerk-002",
    parkingSpotId: "472191",
    reservationId: "res-002",
    amount: 8.0,
    duration: 45,
    method: "apple_pay",
    status: "completed",
    createdAt: "2025-11-27T10:30:00.000Z",
  },
  {
    paiementId: "pay_003",
    clerkId: "clerk-003",
    parkingSpotId: "502838",
    amount: 15.0,
    duration: 90,
    method: "google_pay",
    status: "pending",
    createdAt: "2025-11-27T12:00:00.000Z",
  },
  {
    paiementId: "pay_004",
    clerkId: "clerk-004",
    parkingSpotId: "624597",
    reservationId: "res-004",
    amount: 5.5,
    duration: 30,
    method: "credit_card",
    status: "failed",
    createdAt: "2025-11-27T13:15:00.000Z",
  },
  {
    paiementId: "pay_005",
    clerkId: "clerk-002",
    parkingSpotId: "472191",
    amount: 20.0,
    duration: 120,
    method: "apple_pay",
    status: "completed",
    createdAt: "2025-11-27T14:45:00.000Z",
  },
];

// Helper functions
export function getUserById(userId: string): User | undefined {
  return users.find((user) => user.userId === userId);
}

export function getReservationsByUserId(userId: string): Reservation[] {
  return reservations.filter((reservation) => reservation.userId === userId);
}
