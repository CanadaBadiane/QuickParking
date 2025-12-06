"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import AccessDenied from "../components/AccessDenied";

interface UserProfile {
  userId: string;
  clerkId: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

// Page pour afficher et éditer le profil utilisateur
export default function UserProfilePage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectedUserRole, setConnectedUserRole] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();

        // Récupère le userId de l'URL, sinon utilise le clerkId de l'utilisateur connecté
        const userIdFromUrl = searchParams.get("userId");
        const userId = userIdFromUrl || user?.id;

        if (!userId) return;

        // Récupère le profil à afficher
        const res = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setProfile(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || "",
            role: data.user.role,
          });
        } else {
          toast.error(data.error || "Erreur lors du chargement du profil");
        }

        // Récupère le rôle de l'utilisateur connecté pour vérifier les permissions
        if (user?.id) {
          const connectedRes = await fetch(`/api/users/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const connectedData = await connectedRes.json();
          if (connectedData.success) {
            setConnectedUserRole(connectedData.user.role);
          }
        }
      } catch (err) {
        toast.error("Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && user) {
      fetchProfile();
    }
  }, [isSignedIn, user, getToken]);

  const handleUpdate = async () => {
    if (!user || !profile) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${profile.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setProfile(data.user);
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès");
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      )
    ) {
      return;
    }

    if (!user || !profile) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/users/${profile.userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Compte supprimé avec succès");
        // Redirection selon le rôle du user connecté
        if (connectedUserRole === "admin") {
          window.location.href = "/allUsers";
        } else {
          window.location.href = "/inscription";
        }
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Profil introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Utilisateur
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                {profile.userId}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clerk ID
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 break-all">
                {profile.clerkId}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                  {profile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                  {profile.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Optionnel"
                  className="w-full p-3 text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                  {profile.phone || "Non renseigné"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              {isEditing && connectedUserRole === "admin" ? (
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-3 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      profile.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {profile.role}
                  </span>
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de création
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex gap-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile.name,
                        email: profile.email,
                        phone: profile.phone || "",
                        role: profile.role,
                      });
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleDelete}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
