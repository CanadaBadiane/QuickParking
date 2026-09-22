"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Paiement } from "@/lib/types";
import Loading from "../components/Loading";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Page pour afficher le détail d'un paiement spécifique
export default function PaiementProfilePage() {
  const [paiement, setPaiement] = useState<Paiement | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editDuration, setEditDuration] = useState<number>(10);
  const router = useRouter();

  useEffect(() => {
    const fetchPaiement = async () => {
      const paiementId = searchParams.get("id");
      if (!paiementId) {
        toast.error("Aucun paiementId fourni dans l'URL");
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await fetch(`/api/paiements/${paiementId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setPaiement(data.paiement);
        } else {
          toast.error(data.error || "Erreur lors du chargement du paiement");
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    if (isLoaded && isSignedIn) fetchPaiement();
  }, [isLoaded, isSignedIn, getToken, searchParams]);

  if (!isLoaded || loading) return <Loading />;
  if (!isSignedIn) return <div className="text-red-600">Accès refusé</div>;

  if (!paiement)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black text-center text-2xl font-bold">
          Aucun paiement trouvé
        </div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full mx-auto mt-10 p-6 bg-white rounded shadow text-black">
          <h2 className="text-2xl font-bold mb-6">Détail du paiement</h2>
          <ul className="space-y-2">
            <li>
              <b>ID Paiement :</b> {paiement.paiementId}
            </li>
            <li>
              <b>User ID :</b> {paiement.userId}
            </li>
            <li>
              <b>ParkingSpot ID :</b> {paiement.parkingSpotId}
            </li>
            <li>
              <b>Reservation ID :</b>{" "}
              {paiement.reservationId || <span className="italic">aucun</span>}
            </li>
            <li>
              <b>Montant :</b> {paiement.amount} $
            </li>
            <li>
              <b>Durée :</b> {paiement.duration} min
            </li>
            <li>
              <b>Méthode :</b> {paiement.method}
            </li>
            <li>
              <b>Statut :</b> {paiement.status}
            </li>
            <li>
              <b>StartDateTime :</b>{" "}
              {paiement.startDateTime ? (
                new Date(paiement.startDateTime).toLocaleString()
              ) : (
                <span className="italic">non défini</span>
              )}
            </li>
            <li>
              <b>EndDateTime :</b>{" "}
              {paiement.endDateTime ? (
                new Date(paiement.endDateTime).toLocaleString()
              ) : (
                <span className="italic">non défini</span>
              )}
            </li>
            <li>
              <b>Créé le :</b> {new Date(paiement.createdAt).toLocaleString()}
            </li>
          </ul>
          {!isEditing ? (
            <div className="mt-8 flex gap-4 justify-center">
              <button
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Modifier la durée
              </button>
            </div>
          ) : (
            <form
              className="mt-8 flex flex-col gap-4 items-center"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!paiement) return;
                try {
                  setLoading(true);
                  const token = await getToken();
                  const res = await fetch(
                    `/api/paiements/${paiement.paiementId}`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ extraMinutes: editDuration }),
                    },
                  );
                  const data = await res.json();
                  if (data.success) {
                    toast.success("Durée modifiée !");
                    setPaiement(data.data);
                    localStorage.setItem(
                      "selectedAmount",
                      String(data.paiement.amount),
                    );
                    router.push(`/paiements?clientSecret=${data.clientSecret}`);
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
              <div>
                <label className="block mb-1">Durée (minutes)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                  required
                  min={10}
                  max={paiement.parkingSpot?.maxDuration}
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 cursor-pointer"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
