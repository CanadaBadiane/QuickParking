export default function AccessDeniedAdmin() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center text-black">
      <div>
        <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
        <p className="mb-6 text-lg">
          Vous devez être administrateur pour accéder à cette page.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
