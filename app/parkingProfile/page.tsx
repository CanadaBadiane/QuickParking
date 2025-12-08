"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";
import AccessDenied from "../components/AccessDenied";
import type { ParkingSpot } from "@/lib/types";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Page pour afficher le profil d'un parking spécifique
export default function ParkingProfilePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const searchParams = useSearchParams();
  const parkingSpotId = searchParams.get("parkingSpotId");
  const [parkingSpot, setParkingSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingSpot = async () => {
      if (!parkingSpotId) return;
      try {
        const token = await getToken();
        const res = await fetch(`/api/parking-spots/${parkingSpotId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setParkingSpot(data.data);
        } else {
          toast.error(data.error || "Erreur lors du chargement du parking");
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn && parkingSpotId) {
      fetchParkingSpot();
    }
  }, [isSignedIn, getToken, parkingSpotId]);

  if (!isLoaded || loading) {
    return <Loading />;
  }
  if (!isSignedIn) {
    return <AccessDenied />;
  }
  if (!parkingSpot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Parking introuvable</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Profil du parking
          </h1>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              <span className="font-medium">ID:</span>{" "}
              {parkingSpot.parkingSpotId}
            </p>
            <p>
              <span className="font-medium">Nom:</span> {parkingSpot.name}
            </p>
            <p>
              <span className="font-medium">Description:</span>{" "}
              {parkingSpot.description}
            </p>
            <p>
              <span className="font-medium">Arrondissement:</span>{" "}
              {parkingSpot.arrondissement}
            </p>
            <p>
              <span className="font-medium">Prix/heure:</span>{" "}
              {parkingSpot.pricePerHour} $
            </p>
            <p>
              <span className="font-medium">Disponible:</span>{" "}
              {parkingSpot.isAvailable ? "Oui" : "Non"}
            </p>
            <p>
              <span className="font-medium">Réservable:</span>{" "}
              {parkingSpot.canReserve ? "Oui" : "Non"}
            </p>
            <p>
              <span className="font-medium">Durée max:</span>{" "}
              {parkingSpot.maxDuration} min
            </p>
            <p>
              <span className="font-medium">Latitude:</span> {parkingSpot.lat}
            </p>
            <p>
              <span className="font-medium">Longitude:</span> {parkingSpot.lng}
            </p>
            <p>
              <span className="font-medium">Caractéristiques:</span>{" "}
              {parkingSpot.features?.join(", ")}
            </p>
            <p>
              <span className="font-medium">Dernière mise à jour:</span>{" "}
              {new Date(parkingSpot.lastUpdated).toLocaleString()}
            </p>
            <div className="mt-8 flex flex-row items-center justify-center gap-4">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer"
                onClick={() => {
                  localStorage.setItem(
                    "selectedParkingSpotId",
                    parkingSpot.parkingSpotId
                  );
                  router.push("/reservation");
                }}
              >
                Réserver
              </button>
              <button
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 cursor-pointer"
                onClick={() => {
                  localStorage.setItem(
                    "selectedParkingSpotId",
                    parkingSpot.parkingSpotId
                  );
                  router.push("/pre-paiements");
                }}
              >
                Payer
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${parkingSpot.lat},${parkingSpot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-center"
              >
                Direction Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
