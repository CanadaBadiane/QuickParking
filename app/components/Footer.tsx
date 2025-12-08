// Footer
export default function Footer() {
  return (
    <footer
      className="w-full py-4 mt-8 text-white text-center"
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <span className="font-semibold">QuickParking</span> &copy;{" "}
        {new Date().getFullYear()} — Tous droits réservés
      </div>
    </footer>
  );
}
