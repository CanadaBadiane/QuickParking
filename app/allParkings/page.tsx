"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";
import type { ParkingSpot } from "@/lib/types";
import Loading from "../components/Loading";

// Page pour afficher tous les parkings
export default function AllParkingsPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const [parkings, setParkings] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/parking-spots", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          const sorted = Array.isArray(data.data)
            ? [...data.data].sort((a, b) =>
                a.parkingSpotId.localeCompare(b.parkingSpotId)
              )
            : [];
          setParkings(sorted);
        } else {
          toast.error(data.error || "Erreur lors du chargement des parkings");
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) {
      fetchParkings();
    }
  }, [isSignedIn, getToken]);

  const handleParkingClick = (parkingSpotId: string) => {
    setSelectedParkingId(parkingSpotId);
    router.push(`/parkingProfile?parkingSpotId=${parkingSpotId}`);
  };

  if (!isLoaded || loading) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Liste des stationnements
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkings.map((parking) => (
            <div
              key={parking.parkingSpotId}
              onClick={() => handleParkingClick(parking.parkingSpotId)}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedParkingId === parking.parkingSpotId
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {parking.name}
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium">ID:</span>{" "}
                  {parking.parkingSpotId}
                </p>
                <p>
                  <span className="font-medium">Arrondissement:</span>{" "}
                  {parking.arrondissement}
                </p>
                <p>
                  <span className="font-medium">Prix/heure:</span>{" "}
                  {parking.pricePerHour} $
                </p>
                <p>
                  <span className="font-medium">Disponible:</span>{" "}
                  {parking.isAvailable ? "Oui" : "Non"}
                </p>
                <p>
                  <span className="font-medium">Réservable:</span>{" "}
                  {parking.canReserve ? "Oui" : "Non"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {parkings.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Aucun stationnement trouvé
          </div>
        )}
      </div>
    </div>
  );
}
