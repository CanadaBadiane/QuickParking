"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import AccessDenied from "../components/AccessDenied";
import Loading from "../components/Loading";

interface Reservation {
  reservationId: string;
  userId: string;
  parkingSpotId: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Page pour afficher le profil d'une réservation spécifique
export default function ReservationProfilePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editDuration, setEditDuration] = useState<number>(5);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) return;
      try {
        const token = await getToken();
        const res = await fetch(`/api/reservations/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setReservation(data.data);
          // Préremplir la durée avec la durée actuelle
          if (data.data) {
            const start = new Date(data.data.startDateTime).getTime();
            const end = new Date(data.data.endDateTime).getTime();
            const duration = Math.round((end - start) / 60000);
            setEditDuration(duration);
          }
        } else {
          toast.error(
            data.error || "Erreur lors du chargement de la réservation"
          );
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn && reservationId) {
      fetchReservation();
    }
  }, [isSignedIn, getToken, reservationId]);

  if (!isLoaded || loading) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  if (!reservation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Réservation introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Profil de la réservation
        </h1>
        <div className="space-y-4 text-lg text-gray-700">
          <p>
            <span className="font-medium">Parking Spot ID:</span>{" "}
            {reservation.parkingSpotId}
          </p>
          <p>
            <span className="font-medium">ID réservation:</span>{" "}
            {reservation.reservationId}
          </p>
          <p>
            <span className="font-medium">User ID:</span> {reservation.userId}
          </p>
          <p>
            <span className="font-medium">Statut:</span> {reservation.status}
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
            <span className="font-medium">Créée le:</span>{" "}
            {new Date(reservation.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Mis à jour le:</span>{" "}
            {new Date(reservation.updatedAt).toLocaleString()}
          </p>
        </div>

        {/* Bouton Modifier */}
        {!isEditing ? (
          <div className="mt-8 flex gap-4 justify-center">
            <button
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
              onClick={() => setIsEditing(true)}
            >
              Modifier la durée
            </button>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={async () => {
                if (!reservationId) return;
                if (
                  !window.confirm("Confirmer l'annulation de la réservation ?")
                )
                  return;
                try {
                  setLoading(true);
                  const token = await getToken();
                  const res = await fetch(
                    `/api/reservations/${reservationId}`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ cancel: true }),
                    }
                  );
                  const data = await res.json();
                  if (data.success) {
                    toast.success("Réservation annulée");
                    router.push("/reservation");
                  } else {
                    toast.error(data.error || "Erreur lors de l'annulation");
                  }
                } catch {
                  toast.error("Erreur serveur");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Annulation..." : "Annuler la réservation"}
            </button>
          </div>
        ) : (
          <form
            className="mt-8 flex flex-col gap-4 items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reservation) return;
              const now = new Date(reservation.startDateTime);
              const newEndDateTime = new Date(
                now.getTime() + editDuration * 60000
              ).toISOString();
              try {
                setLoading(true);
                const token = await getToken();
                const res = await fetch(
                  `/api/reservations/${reservation.reservationId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ extraMinutes: editDuration }),
                  }
                );
                const data = await res.json();
                if (data.success) {
                  toast.success("Durée modifiée !");
                  setReservation(data.data);
                  setIsEditing(false);
                } else {
                  toast.error(data.error || "Erreur lors de la modification");
                }
              } catch {
                toast.error("Erreur serveur");
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="text-black w-full">
              Nouvelle durée (minutes)
              <input
                type="range"
                min={5}
                max={15}
                step={1}
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="text-sm mt-2 text-black">
                Durée sélectionnée :{" "}
                <b className="text-black">{editDuration} min</b>
              </div>
            </label>
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
