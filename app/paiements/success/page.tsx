// Page affichée après un paiement réussi
export default function PaiementSuccess() {
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        Paiement réussi !
      </h2>
      <p className="text-black">Merci pour votre paiement.</p>
    </div>
  );
}
