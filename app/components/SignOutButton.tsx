"use client";
import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
    >
      Déconnexion
    </button>
  );
}
