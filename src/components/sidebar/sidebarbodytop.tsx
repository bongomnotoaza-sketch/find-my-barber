
export default function SidebarBodyTop() {
  return (
    <div className="h-[10%] shrink-0 border-b border-white/10 flex items-center justify-start px-3">
      {/* User Icon */}
      <div className="p-[2px] rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 shrink-0">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </div>
      </div>

      {/* User Info */}
      <div className="ml-3 min-w-0 flex flex-col justify-center">
        <div className="text-sm font-semibold text-white truncate">
          Display Name
        </div>

        <div className="text-xs text-zinc-500 mt-0.5 truncate">
          Small bio goes here
        </div>
      </div>
    </div>
  );
}
