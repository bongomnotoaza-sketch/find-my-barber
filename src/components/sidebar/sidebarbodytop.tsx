export default function SidebarBodyTop() {
  return (
    <div className="h-[10%] shrink-0 border-b border-white/70 flex items-end justify-start p-3">
      <div className="w-8 h-8 rounded-md bg-green-500 text-white flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="w-5 h-5"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="ml-2 text-sm font-semibold"><span className="text-white">Logic</span><span className="text-green-500">Tree</span></div>
    </div>
  );
}