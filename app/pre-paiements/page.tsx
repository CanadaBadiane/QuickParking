"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";
import { useUser } from "@clerk/nextjs";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Page pour créer un pré-paiement
export default function PrePaiementPage() {
  const [parkingspotId, setParkingspotId] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [role, setRole] = useState<string>("");
  const [clerkId, setClerkId] = useState("");
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // Récupère le parkingSpotId du localStorage au chargement de la page
  useEffect(() => {
    const storedId = localStorage.getItem("selectedParkingSpotId");
    if (storedId) {
      setParkingspotId(storedId);
      localStorage.removeItem("selectedParkingSpotId");
    }
  }, []);

  useEffect(() => {
    // Récupère le rôle de l'utilisateur
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
  }, [user, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const body: any = {
        parkingSpotId: parkingspotId,
        duration: Number(duration),
      };
      if (role === "admin" && clerkId) {
        body.clerkId = clerkId;
      }
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok)
        toast.error(data?.error || data?.message || "Erreur paiement");
      // Stocke l'ID et le montant dans le localStorage pour la page paiement
      localStorage.setItem("selectedParkingSpotId", parkingspotId);
      if (data.paiement && data.paiement.amount) {
        localStorage.setItem("selectedAmount", String(data.paiement.amount));
      }
      if (data.clientSecret) {
        router.push("/paiements?clientSecret=" + data.clientSecret);
      } else {
        toast.error("Erreur : clientSecret manquant !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du paiement");
    } finally {
      setLoading(false);
    }
  };

  // Affiche un loader pendant la vérification de l'authentification
  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return (
      <div className="text-center text-2xl mt-10 text-black">
        Connecte-toi pour créer un paiement.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4">Création du paiement...</h2>
        <div className="text-white">Veuillez patienter...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-lg w-full p-6 border rounded shadow bg-white text-black">
            <h2 className="text-xl font-bold mb-4">Créer un paiement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Parking Spot ID</label>
                <input
                  type="text"
                  value={parkingspotId}
                  onChange={(e) => setParkingspotId(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {role === "admin" && (
                <div>
                  <label className="block mb-1">
                    Clerk ID de l'utilisateur cible
                  </label>
                  <input
                    type="text"
                    value={clerkId}
                    onChange={(e) => setClerkId(e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="clerkId de l'utilisateur"
                  />
                </div>
              )}
              <div>
                <label className="block mb-1">Durée (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  required
                  min={10}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Création..." : "Créer le paiement"}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
