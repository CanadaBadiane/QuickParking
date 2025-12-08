"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";

// Page pour créer un pré-paiement
export default function PrePaiementPage() {
  const [parkingspotId, setParkingspotId] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // Récupère le parkingSpotId du localStorage au chargement de la page
  useEffect(() => {
    const storedId = localStorage.getItem("selectedParkingSpotId");
    if (storedId) {
      setParkingspotId(storedId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parkingSpotId: parkingspotId,
          duration: Number(duration),
        }),
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
      <div className="text-center mt-10 text-red-500">
        Connecte-toi pour créer un paiement.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4">Création du paiement...</h2>
        <div className="text-blue-600">Veuillez patienter...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white text-black">
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
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer le paiement"}
        </button>
      </form>
    </div>
  );
}
