import "./globals.css";
import ShowToken from "./components/token";
import SignOutButton from "./components/SignOutButton";

// Page d'accueil après connexion
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">QuickParking</h1>
            </div>
            <div className="flex items-center gap-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue sur QuickParking
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Gérez vos réservations de stationnement en toute simplicité.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/userProfile"
              className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Voir le profil
              </h3>
              <p className="text-gray-600">
                Accédez à votre profil utilisateur
              </p>
            </a>

            <a
              href="/reservation"
              className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Historique de vos réservations
              </h3>
              <p className="text-gray-600">
                Accédez à votre historique de vos réservations
              </p>
            </a>

            <a
              href="/api/parking-spots"
              className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                Stationnements
              </h3>
              <p className="text-gray-600">Consultez les places disponibles</p>
            </a>
          </div>
        </div>

        {/* Token pour les tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Token de test
          </h3>
          <ShowToken />
        </div>
      </main>
    </div>
  );
}
