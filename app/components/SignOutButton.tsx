"use client";
import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();
  return <button onClick={() => signOut()}>Déconnexion</button>;
}
