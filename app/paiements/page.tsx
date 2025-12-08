"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Header from "../components/Header";
import Footer from "../components/Footer";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gère la soumission du formulaire de paiement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) {
      setError("Stripe n'est pas prêt.");
      setLoading(false);
      return;
    }
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/paiements/success",
      },
    });
    if (result.error) {
      setError(result.error.message || "Erreur lors du paiement");
    }
    setLoading(false);
  };

  return (
    <form
      className="flex flex-col gap-4 max-w-xl w-full mx-auto"
      style={{ minWidth: 350 }}
      onSubmit={handleSubmit}
    >
      <PaymentElement />
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded"
        disabled={loading || !stripe}
      >
        {loading ? "Paiement en cours..." : "Payer"}
      </button>
    </form>
  );
}

// Page principale de paiement
export default function PaiementsPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [parkingSpotId, setParkingSpotId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const secret = params.get("clientSecret");
      if (secret) setClientSecret(secret);

      const storedIdStorage = localStorage.getItem("selectedParkingSpotId");
      if (storedIdStorage) {
        setParkingSpotId(storedIdStorage);
        localStorage.removeItem("selectedParkingSpotId");
      }
      const storedAmount = localStorage.getItem("selectedAmount");
      if (storedAmount) {
        setAmount(storedAmount);
        localStorage.removeItem("selectedAmount");
      }
    }
  }, []);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-black ">Paiement</h2>
          {parkingSpotId && (
            <div className="mb-2 text-black">
              Place de parking :{" "}
              <span className="font-semibold">{parkingSpotId}</span>
            </div>
          )}
          {amount && (
            <div className="mb-4 text-black">
              Montant à payer :{" "}
              <span className="font-semibold">{amount} $</span>
            </div>
          )}
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          ) : (
            <div className="text-black">Chargement du paiement...</div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
