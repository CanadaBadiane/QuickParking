"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";
import AccessDeniedAdmin from "../components/AccessDeniedAdmin";

interface Reservation {
  reservationId: string;
  userId: string;
  parkingSpotId: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  createdAt: string;
}

// Page pour afficher toutes les réservations (accessible uniquement aux admins)
export default function AllReservationsPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/reservations/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          // Tri décroissant par createdAt
          const sorted = [...data.data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReservations(sorted);
          setIsAdmin(true);
        } else {
          if (res.status === 403) {
            setIsAdmin(false);
          } else {
            toast.error(
              data.error || "Erreur lors du chargement des réservations"
            );
          }
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) {
      fetchReservations();
    }
  }, [isSignedIn, getToken]);

  const handleReservationClick = async (reservationId: string) => {
    setSelectedReservationId(reservationId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/reservations/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Réservation ${reservationId} chargée`);
        router.push(`/reservationProfile?reservationId=${reservationId}`);
      } else {
        toast.error(
          data.error || "Erreur lors du chargement de la réservation"
        );
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  if (!isAdmin) {
    return <AccessDeniedAdmin />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Liste des réservations
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <div
              key={reservation.reservationId}
              onClick={() => handleReservationClick(reservation.reservationId)}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedReservationId === reservation.reservationId
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Réservation: {reservation.reservationId}
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium">User ID:</span>{" "}
                  {reservation.userId}
                </p>
                <p>
                  <span className="font-medium">Parking Spot ID:</span>{" "}
                  {reservation.parkingSpotId}
                </p>
                <p>
                  <span className="font-medium">Début:</span>{" "}
                  {new Date(reservation.startDateTime).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Fin:</span>{" "}
                  {new Date(reservation.endDateTime).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Statut:</span>{" "}
                  {reservation.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {reservations.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Aucune réservation trouvée
          </div>
        )}
      </div>
    </div>
  );
}
