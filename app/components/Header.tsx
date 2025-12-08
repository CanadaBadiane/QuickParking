import SignOutButton from "../components/SignOutButton";

// Header
export default function Header() {
  return (
    <nav
      className="shadow-sm border-b"
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
      }}
    >
      <div className="flex justify-between items-center h-16 px-4 w-full">
        <a href="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-12 mr-2 transition-transform group-hover:scale-105"
          />
          <h1 className="text-2xl font-bold text-white cursor-pointer group-hover:underline">
            QuickParking
          </h1>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/allParkings"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Stationnement
          </a>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
