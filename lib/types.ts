// Types pour l'application QuickParking

export interface ParkingSpot {
  parkingSpotId: string;
  name: string;
  address: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  arrondissement: string;
  pricePerHour: number;
  isAvailable: boolean;
  canReserve: boolean;
  maxDuration: number;
  features: string[];
  restrictions: string;
  nearbyLandmarks: string[];
  nextAvailable?: string;
  source: string;
  lastUpdated: string;
}

export interface User {
  userId: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  password: String;
  createdAt: string;
}

export interface Reservation {
  reservationId: string;
  userId: string;
  parkingSpotId: string;
  startDateTime: string;
  endDateTime: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;

  // Relations (optionnelles pour les réponses détaillées)
  user?: User;
  parkingSpot?: ParkingSpot;
}

export interface ReservationRequest {
  userId: string;
  parkingSpotId: string;
  startDateTime: string;
  endDateTime: string;
}

export interface Paiement {
  paiementId: string;
  clerkId: string;
  parkingSpotId: String;
  reservationId?: string;
  amount: number;
  duration: number; // en minutes
  method: "credit_card" | "apple_pay" | "google_pay";
  status: "pending" | "completed" | "failed";
  createdAt: string;
}
