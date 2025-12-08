"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AccessDenied from "../components/AccessDenied";
import AccessDeniedAdmin from "../components/AccessDeniedAdmin";
import Loading from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Page pour afficher tous les utilisateurs (accessible uniquement aux admins)
export default function AllUsersPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/users/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
          setIsAdmin(true);
        } else {
          if (res.status === 403) {
            setIsAdmin(false);
          } else {
            toast.error(
              data.error || "Erreur lors du chargement des utilisateurs"
            );
          }
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchUsers();
    }
  }, [isSignedIn, getToken]);

  const handleUserClick = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Profil de ${data.user.name} chargé`);
        // Redirige vers la page userProfile avec le userId
        router.push(`/userProfile?userId=${userId}`);
      } else {
        toast.error(data.error || "Erreur lors du chargement du profil");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  // Affiche un loader pendant la vérification de l'authentification
  if (!isLoaded || loading) {
    return <Loading />;
  }

  // Affiche AccessDenied si non authentifié
  if (!isSignedIn) {
    return <AccessDenied />;
  }

  // Affiche AccessDeniedAdmin si pas admin
  if (!isAdmin) {
    return <AccessDeniedAdmin />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            Liste des utilisateurs
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.userId}
                onClick={() => handleUserClick(user.userId)}
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg hover:bg-linear-to-br hover:from-purple-200 hover:to-purple-400 cursor-pointer ${
                  selectedUserId === user.userId ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {user.name}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">ID:</span> {user.userId}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p>
                    <span className="font-medium">Rôle:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center text-2xl text-black mt-8">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
