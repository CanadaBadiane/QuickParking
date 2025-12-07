"use client";

import { useState, useEffect } from "react";
import type { Reservation } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";
import Loading from "../components/Loading";

// Page pour afficher l'historique des réservations de l'utilisateur connecté
export default function ReservationHistoryPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/reservations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          const reservationsArr = Array.isArray(data.data?.reservations)
            ? data.data.reservations
            : [];
          reservationsArr.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReservations(reservationsArr);
        } else {
          toast.error(
            data.error || "Erreur lors du chargement des réservations"
          );
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

  if (!isLoaded || loading) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  // Fonction pour gérer le clic sur une réservation
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
        toast.success("Réservation chargée");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl px-2 sm:px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Historique de mes réservations
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(reservations) &&
            reservations.map((reservation) => (
              <div
                key={reservation.reservationId}
                onClick={() =>
                  handleReservationClick(reservation.reservationId)
                }
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedReservationId === reservation.reservationId
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Place: {reservation.parkingSpotId}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">ID réservation:</span>{" "}
                    {reservation.reservationId}
                  </p>
                  <p>
                    <span className="font-medium">User ID:</span>{" "}
                    {reservation.userId}
                  </p>
                  <p>
                    <span className="font-medium">Statut:</span>{" "}
                    {reservation.status}
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
                    <span className="font-medium">Mis à jour le:</span>{" "}
                    {new Date(reservation.updatedAt).toLocaleString()}
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
