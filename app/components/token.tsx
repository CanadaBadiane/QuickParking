"use client";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function ShowToken() {
  const { getToken, isSignedIn } = useAuth();
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleShowToken() {
    const t = await getToken();
    setToken(t || "");
    setCopied(false);
  }

  function handleCopy() {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
    }
  }

  if (!isSignedIn) return <div>Non connecté</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        maxWidth: 600,
      }}
    >
      <button onClick={handleShowToken} style={{ marginBottom: 8 }}>
        Afficher mon token Clerk
      </button>
      {token && (
        <>
          <textarea
            value={token}
            readOnly
            rows={4}
            style={{ width: "100%", fontSize: 12, marginBottom: 8 }}
            onFocus={(e) => e.target.select()}
          />
          <button onClick={handleCopy} style={{ marginBottom: 8 }}>
            {copied ? "Copié !" : "Copier le token"}
          </button>
        </>
      )}
    </div>
  );
}
