import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
    link.rel = "stylesheet";
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);
  }, []);

  return (
    <header className="relative w-full h-[10%] flex flex-col items-center bg-zinc-900/80 pb-4 pt-8">
      {/* Search icon - pinned top left */}
      <button type="button" className="absolute left-4 top-8">
        <Search size={22} color="#f97316" />
      </button>

      {/* Logo */}
      {fontsLoaded && (
        <span className="text-2xl" style={{ fontFamily: "Pacifico" }}>
          <span className="text-orange-500">Find</span>
          <span className="text-red-500"> My Barber</span>
        </span>
      )}
    </header>
  );
}