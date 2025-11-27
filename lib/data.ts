import { User, Reservation } from "./types";

// Utilisateurs simulés
export const users: User[] = [
  {
    idUser: "user-001",
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "+1 514 123-4567",
    password: "Coucou76",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    idUser: "user-002",
    name: "Jean Tremblay",
    email: "jean.tremblay@email.com",
    phone: "+1 514 234-5678",
    password: "Coucou76",
    createdAt: "2024-02-10T14:20:00Z",
  },
  {
    idUser: "user-003",
    name: "Sophie Martin",
    email: "sophie.martin@email.com",
    password: "Coucou76",
    createdAt: "2024-03-05T09:15:00Z",
  },
];

// Réservations simulées
export const reservations: Reservation[] = [
  {
    idReservation: "res-001",
    userId: "user-001",
    parkingSpotId: "463543", // ID réel de Montréal
    startDateTime: "2025-11-21T09:00:00Z",
    endDateTime: "2025-11-21T09:15:00Z",
    status: "active",
    createdAt: "2025-11-20T08:30:00Z",
    updatedAt: "2025-11-20T08:30:00Z",
  },
  {
    idReservation: "res-002",
    userId: "user-001",
    parkingSpotId: "472191",
    startDateTime: "2025-11-20T14:00:00Z",
    endDateTime: "2025-11-20T14:15:00Z",
    status: "completed",
    createdAt: "2025-11-20T13:45:00Z",
    updatedAt: "2025-11-20T16:05:00Z",
  },
  {
    idReservation: "res-003",
    userId: "user-002",
    parkingSpotId: "502838",
    startDateTime: "2025-11-21T10:30:00Z",
    endDateTime: "2025-11-21T10:45:00Z",
    status: "active",
    createdAt: "2025-11-20T09:15:00Z",
    updatedAt: "2025-11-20T09:15:00Z",
  },
  {
    idReservation: "res-004",
    userId: "user-001",
    parkingSpotId: "624597",
    startDateTime: "2025-11-19T08:00:00Z",
    endDateTime: "2025-11-19T08:15:00Z",
    status: "completed",
    createdAt: "2025-11-19T07:30:00Z",
    updatedAt: "2025-11-19T10:05:00Z",
  },
];

// Helper functions
export function getUserById(userId: string): User | undefined {
  return users.find((user) => user.idUser === userId);
}

export function getReservationsByUserId(userId: string): Reservation[] {
  return reservations.filter((reservation) => reservation.userId === userId);
}
