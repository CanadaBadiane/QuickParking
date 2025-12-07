// Types pour l'application QuickParking

export interface ParkingSpot {
  parkingSpotId: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  arrondissement: string;
  pricePerHour: number;
  isAvailable: boolean;
  canReserve: boolean;
  maxDuration: number;
  features: string[];
  lastUpdated: string;
}

export interface User {
  userId: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  password: string;
  confirmationPassword: string;
  deletedAt?: string | null;
  createdAt: string;
}

export interface Reservation {
  reservationId: string;
  userId: string;
  parkingSpotId: string;
  startDateTime: string;
  endDateTime: string;
  extraMinutes?: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;

  // Relations (optionnelles pour les réponses détaillées)
  user?: User;
  parkingSpot?: ParkingSpot;
}

export interface Paiement {
  paiementId: string;
  clerkId: string;
  userId: string;
  parkingSpotId: string;
  reservationId?: string;
  amount: number;
  duration: number; // en minutes
  method: "card";
  status: "pending" | "completed" | "failed";
  createdAt: string;
}
