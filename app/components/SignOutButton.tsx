"use client";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <button
      onClick={() => signOut(() => router.push("/sign-in"))}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
    >
      Déconnexion
    </button>
  );
}
