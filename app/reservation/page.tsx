"use client";

import AccessDenied from "../components/AccessDenied";
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Page de réservation de place de parking
export default function ReservationPage() {
  const [parkingSpotId, setParkingSpotId] = useState("");
  const [duration, setDuration] = useState(5); // durée en minutes
  const [loading, setLoading] = useState(false);
  const [clerkId, setClerkId] = useState("");
  const [role, setRole] = useState<string>("");
  const { user } = useUser();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Préremplir le parkingSpotId si présent dans localStorage
    const storedId = localStorage.getItem("selectedParkingSpotId");
    if (storedId) {
      setParkingSpotId(storedId);
      localStorage.removeItem("selectedParkingSpotId");
    }
    const fetchRole = async () => {
      if (!user) return;
      const token = await getToken();
      const res = await fetch(`/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRole(data.user.role);
    };
    fetchRole();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const now = new Date();
    const endDateTime = new Date(
      now.getTime() + duration * 60000
    ).toISOString();
    const body: any = { parkingSpotId, endDateTime };
    if (role === "admin" && clerkId) {
      body.clerkId = clerkId;
    }
    try {
      const token = await getToken();
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Réservation créée !");
        const reservationId = data.data?.reservationId;
        if (reservationId) {
          router.push(`/reservationProfile?reservationId=${reservationId}`);
        }
      } else {
        toast.error(data.error || "Erreur lors de la réservation");
      }
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl mx-auto mt-10 p-12 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6 text-black">
              Réserver une place de stationnement
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {role === "admin" && (
                <label className="text-black">
                  Clerk ID (pour admin)
                  <input
                    type="text"
                    value={clerkId}
                    onChange={(e) => setClerkId(e.target.value)}
                    className="w-full p-2 border rounded mt-1 text-black"
                    placeholder="Clerk ID de l'utilisateur"
                  />
                </label>
              )}
              <label className="text-black">
                Parking Spot ID
                <input
                  type="text"
                  value={parkingSpotId}
                  onChange={(e) => setParkingSpotId(e.target.value)}
                  className="w-full p-2 border rounded mt-1 text-black"
                  required
                />
              </label>
              <label className="text-black">
                Durée (minutes)
                <input
                  type="range"
                  min={5}
                  max={15}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-sm mt-2 text-black">
                  Durée sélectionnée :{" "}
                  <b className="text-black">{duration} min</b>
                </div>
              </label>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Réservation..." : "Réserver"}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
