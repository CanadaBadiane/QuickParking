// Types pour l'application QuickParking

export interface ParkingSpot {
  id: string;
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
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Reservation {
  idReservation: string;
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
