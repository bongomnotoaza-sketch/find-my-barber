import { useState } from 'react';

const toggleOptions = [
  'bookings', 'tickets', 'refunds', 'reviews',
  'account settings', 'help', 'terms and conditions'
] as const;

type ToggleOption = typeof toggleOptions[number];

const icons: Record<ToggleOption, string> = {
  'bookings': 'fa-calendar-check',
  'tickets': 'fa-ticket',
  'refunds': 'fa-rotate-left',
  'reviews': 'fa-star',
  'account settings': 'fa-gear',
  'help': 'fa-circle-question',
  'terms and conditions': 'fa-file-contract'
};

type SidebarBodyBottomProps = {
  onSignOut: () => void | Promise<void>;
};

export default function SidebarBodyBottom({ onSignOut }: SidebarBodyBottomProps) {
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onSignOut();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable toggle options */}
      <div className="flex flex-col gap-1 p-2 overflow-y-auto flex-1">
        {toggleOptions.map((option) => (
          <div
            key={option}
            className="w-full h-12 md:h-14 grid grid-cols-[20%_80%] overflow-hidden
              transition-transform duration-300 ease-out hover:translate-x-2"
          >
            <div className="flex items-center justify-center text-white font-sans">
              <span className={`fa-solid ${icons[option]}`} />
            </div>
            <div className="flex items-center justify-start text-white font-medium font-sans capitalize">
              {option}
            </div>
          </div>
        ))}
      </div>

      {/* Sign out button pinned at bottom */}
      <div className="p-2 border-t border-white/20">
        <button
          type="button"
          disabled={pending}
          onClick={handleSignOut}
          className="w-full h-12 md:h-14 grid grid-cols-[20%_80%] overflow-hidden
            transition-transform duration-300 ease-out hover:translate-x-2
            cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:translate-x-0"
        >
          <div className="flex items-center justify-center text-white font-sans">
            <span
              className={`fa-solid ${
                pending ? 'fa-spinner fa-spin' : 'fa-right-from-bracket'
              }`}
            />
          </div>
          <div className="flex items-center justify-start text-white font-medium font-sans">
            {pending ? 'Signing out…' : 'Sign Out'}
          </div>
        </button>
      </div>
    </div>
  );
}