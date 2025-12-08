import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

// Page affichée après un paiement réussi
export default function PaiementSuccess() {
  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-lg w-full p-6 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-6 text-green-700">
            Paiement réussi !
          </h2>
          <p className="text-black">Merci pour votre paiement.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
