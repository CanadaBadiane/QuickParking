"use client";

import { useState, useEffect } from "react";
import type { Paiement } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Page pour afficher tous les paiements de l'utilisateur connecté
export default function PaiementHistoryPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaiementId, setSelectedPaiementId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/paiements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const arr = Array.isArray(data.paiements) ? data.paiements : [];
          arr.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPaiements(arr);
        } else {
          toast.error(data.error || "Erreur lors du chargement des paiements");
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) fetchPaiements();
  }, [isSignedIn, getToken]);

  if (!isLoaded || loading) return <Loading />;
  if (!isSignedIn) return <div className="text-red-600">Accès refusé</div>;

  if (selectedPaiementId) {
    router.push(`/paiementProfile?id=${selectedPaiementId}`);
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Historique de mes paiements
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paiements.map((p) => (
              <div
                key={p.paiementId}
                onClick={() => setSelectedPaiementId(p.paiementId)}
                className={`bg-white rounded-lg shadow p-6 hover:bg-gradient-to-br hover:from-purple-200 hover:to-purple-400 cursor-pointer ${
                  selectedPaiementId === p.paiementId
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Place: {p.parkingSpotId}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">ID paiement:</span>{" "}
                    {p.paiementId}
                  </p>
                  <p>
                    <span className="font-medium">User ID:</span> {p.userId}
                  </p>
                  <p>
                    <span className="font-medium">Montant:</span> {p.amount} $
                  </p>
                  <p>
                    <span className="font-medium">Durée:</span> {p.duration} min
                  </p>
                  <p>
                    <span className="font-medium">Statut:</span> {p.status}
                  </p>
                  <p>
                    <span className="font-medium">Créé le:</span>{" "}
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {paiements.length === 0 && (
            <div className="text-center text-2xl text-black mt-8">
              Aucun paiement trouvé
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
