"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import AccessDenied from "../components/AccessDenied";
import Loading from "../components/Loading";

// Page de connexion pour les utilisateurs existants
export default function ConnexionPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connexion réussie !");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(data.error || "Erreur lors de la connexion");
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
      <h2 className="text-2xl font-bold mb-6 text-black">Connexion</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
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
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
