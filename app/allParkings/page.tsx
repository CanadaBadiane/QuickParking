"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";
import type { ParkingSpot } from "@/lib/types";
import Loading from "../components/Loading";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Page pour afficher tous les parkings
export default function AllParkingsPage() {
  const [filter, setFilter] = useState<"all" | "available" | "unavailable">(
    "all"
  );
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
    <>
      <Header />
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Liste des stationnements
          </h1>
          <div className="mb-6 flex gap-4">
            <button
              className={`px-4 py-2 rounded cursor-pointer ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-600 border"
              }`}
              onClick={() => setFilter("all")}
            >
              Tous
            </button>
            <button
              className={`px-4 py-2 rounded cursor-pointer ${
                filter === "available"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-600 border"
              }`}
              onClick={() => setFilter("available")}
            >
              Disponible
            </button>
            <button
              className={`px-4 py-2 rounded cursor-pointer ${
                filter === "unavailable"
                  ? "bg-red-600 text-white"
                  : "bg-white text-red-600 border"
              }`}
              onClick={() => setFilter("unavailable")}
            >
              Non disponible
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const filtered = parkings.filter((parking) => {
                if (filter === "available") {
                  return parking.canReserve && parking.isAvailable;
                }
                if (filter === "unavailable") {
                  return !parking.canReserve || !parking.isAvailable;
                }
                return true;
              });
              if (filtered.length === 0) {
                return (
                  <div className="col-span-full text-center text-2xl text-black mt-8">
                    Aucun stationnement trouvé pour ce filtre
                  </div>
                );
              }
              return filtered.map((parking) => (
                <div
                  key={parking.parkingSpotId}
                  onClick={() => handleParkingClick(parking.parkingSpotId)}
                  className={`bg-white rounded-lg shadow p-6 hover:shadow-lg hover:bg-linear-to-br hover:from-purple-200 hover:to-purple-400 cursor-pointer ${
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
              ));
            })()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
