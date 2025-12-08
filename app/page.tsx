"use client";

import "./globals.css";
import ShowToken from "./components/token";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import AccessDenied from "./components/AccessDenied";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loading from "./components/Loading";

// Page d'accueil
export default function Home() {
  const { user } = useUser();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [roleBdd, setRoleBdd] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) return;
      try {
        const token = await getToken();
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user?.role) {
          setRoleBdd(data.user.role);
        } else {
          setRoleBdd(null);
        }
      } catch {
        setRoleBdd(null);
      } finally {
        setLoadingRole(false);
      }
    };
    if (isSignedIn && user?.id) fetchRole();
  }, [isSignedIn, user, getToken]);

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <AccessDenied />;
  if (loadingRole)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Chargement du rôle...</span>
      </div>
    );
  if (!user || !user.id || roleBdd === null) return <AccessDenied />;

  // Affichage conditionnel selon le rôle de la BDD
  return (
    <div className="flex flex-col min-h-screen ">
      {/* Navbar */}
      <Header />

      {/* Contenu principal */}
      <main className="flex-1 flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {roleBdd === "user" ? (
            <>
              {" "}
              {/* Interface User */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenue sur QuickParking
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Gérez vos réservations de stationnement en toute simplicité.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/userProfile"
                  className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    Voir le profil
                  </h3>
                  <p className="text-gray-600">
                    Accédez à votre profil utilisateur
                  </p>
                </a>

                <a
                  href="/reservationHistory"
                  className="p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                    Historique de vos réservations
                  </h3>
                  <p className="text-gray-600">
                    Accédez à votre historique de vos réservations
                  </p>
                </a>

                <a
                  href="/paiementHistory"
                  className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-purple-900 mb-2">
                    Historique de vos paiements
                  </h3>
                  <p className="text-gray-600">
                    Accédez à votre historique de vos paiements{" "}
                  </p>
                </a>
                <a
                  href="/reservation"
                  className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-orange-900 mb-2">
                    Réserver
                  </h3>
                  <p className="text-gray-600">
                    Réservez une place de parking{""}
                  </p>
                </a>
                <a
                  href="/pre-paiements"
                  className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Payer
                  </h3>
                  <p className="text-gray-600">
                    Payer une place de parking{""}
                  </p>
                </a>
              </div>{" "}
            </>
          ) : roleBdd === "admin" ? (
            <>
              {/* Interface Admin */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenue sur le dashboard de QuickParking
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Accédez à la gestion complète du parking et des utilisateurs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/userProfile"
                  className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    Voir le profil
                  </h3>
                  <p className="text-gray-600">Accédez à votre profil admin</p>
                </a>
                <a
                  href="/allUsers"
                  className="p-6 bg-fuchsia-50 rounded-lg hover:bg-fuchsia-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-fuchsia-900 mb-2">
                    Voir tous les profils
                  </h3>
                  <p className="text-gray-600">Accédez à tous les profils</p>
                </a>

                <a
                  href="/allReservations"
                  className="p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                    Voir les réservations
                  </h3>
                  <p className="text-gray-600">
                    Accédez à toutes les réservations
                  </p>
                </a>

                <a
                  href="/allPaiements"
                  className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-purple-900 mb-2">
                    Voir les paiements
                  </h3>
                  <p className="text-gray-600">Accédez à tous les paiements</p>
                </a>
                <a
                  href="/reservation"
                  className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-orange-900 mb-2">
                    Réserver
                  </h3>
                  <p className="text-gray-600">
                    Réservez une place de parking{""}
                  </p>
                </a>
                <a
                  href="/pre-paiements"
                  className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Payer
                  </h3>
                  <p className="text-gray-600">
                    Payer une place de parking{""}
                  </p>
                </a>
              </div>{" "}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
