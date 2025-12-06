export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center text-red-600">
      <div>
        <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
        <p className="mb-6">
          Vous devez être authentifié pour accéder à cette page.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/sign-in"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </a>
          <a
            href="/sign-up"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Créer un compte
          </a>
        </div>
      </div>
    </div>
  );
}
