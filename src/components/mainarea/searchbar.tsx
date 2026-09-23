import { FaBars } from "react-icons/fa";

interface SearchBarProps {
  onToggleSidebar: () => void;
}

export default function SearchBar({ onToggleSidebar }: SearchBarProps) {
  return (
    <div className="w-[80%] md:w-[60%] min-h-12 md:min-h-16 mx-auto my-[3%] grid grid-cols-[20%_50%_30%] md:grid-cols-[10%_80%_10%] items-center bg-[#2d2d2d] shadow-2xl border border-transparent transition-all duration-300 hover:border-gray-400 focus-within:border-gray-300 rounded-full">
      <div className="flex items-center justify-center">
        <button
          aria-label="Toggle menu"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSidebar();
          }}
          className="text-white"
        >
          <FaBars size={18} />
        </button>
      </div>

      <input
        type="text"
        placeholder="Search"
        className="w-full bg-transparent text-base text-white placeholder-gray-400 outline-none pl-2"
      />

      <div className="flex items-center justify-center">
        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-xs md:text-base font-semibold text-white">
          AB
        </div>
      </div>
    </div>
  );
}