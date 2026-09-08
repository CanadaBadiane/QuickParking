"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AccessDenied from "../components/AccessDenied";
import Loading from "../components/Loading";

// Page d'inscription pour les nouveaux utilisateurs
export default function ProfileInformations() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
  });
  const router = useRouter();

  // Affiche un toast si error=deleted dans l'URL
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "deleted") {
      toast.error("Votre compte a été supprimé. Veuillez vous réinscrire.");
      // On retire le paramètre pour éviter le toast en boucle
      params.delete("error");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Inscription réussie !");
        setForm({
          name: "",
          email: "",
          phone: "",
          role: "user",
        });
        setTimeout(() => {
          router.push("/allParkings");
        }, 2000);
      } else {
        if (res.status === 400) {
          toast.error(
            data.error || "Données invalides. Veuillez vérifier les champs.",
          );
        } else {
          toast.error(data.error || "Erreur lors de l'inscription");
        }
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  // Affiche un loader pendant la vérification de l'authentification
  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-black ">
        Informations du profile
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
        <input
          type="text"
          name="name"
          placeholder="Nom"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone"
          value={form.phone}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 cursor-pointer"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
}
