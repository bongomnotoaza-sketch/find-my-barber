import { useState } from 'react';
import BarbersFollowing from './barbersfollowing';
import BookingsList from './bookings';
import Tickets from './tickets';
import Refunds from './refunds';
import AccountSettings from './accountsettings';

const toggleOptions = [
  'bookings',
  'tickets',
  'refunds',
  'reviews',
  'barbers following',
  'account settings',
  'help',
  'platform policy',
  'refunds policy',
  'privacy policy'
] as const;

type ToggleOption = typeof toggleOptions[number];

const icons: Record<ToggleOption, string> = {
  'bookings': 'fa-calendar-check',
  'tickets': 'fa-ticket',
  'refunds': 'fa-rotate-left',
  'reviews': 'fa-star',
  'barbers following': 'fa-user-group',
  'account settings': 'fa-gear',
  'help': 'fa-circle-question',
  'platform policy': 'fa-building-shield',
  'refunds policy': 'fa-file-invoice-dollar',
  'privacy policy': 'fa-shield-halved'
};

type SidebarBodyBottomProps = {
  onSignOut: () => void | Promise<void>;
};

/* ------------------------------------------------------------------ */
/*  Sub-view registry                                                  */
/*  Add a row here to wire up a new sidebar page — nothing else needs */
/*  to change (handleOptionClick reads from this automatically).       */
/* ------------------------------------------------------------------ */
const subViews = {
  'bookings': {
    title: 'Bookings',
    Component: BookingsList,
  },
  'tickets': {
    title: 'Tickets',
    Component: Tickets,
  },
  'refunds': {
    title: 'Refunds',
    Component: Refunds,
  },
  'barbers following': {
    title: 'Barbers Following',
    Component: BarbersFollowing,
  },
  'account settings': {
    title: 'Account Settings',
    Component: AccountSettings,
  },
} as const;

type SidebarView = 'menu' | keyof typeof subViews;

export default function SidebarBodyBottom({ onSignOut }: SidebarBodyBottomProps) {
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<SidebarView>('menu');

  const handleSignOut = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onSignOut();
    } finally {
      setPending(false);
    }
  };

  const handleOptionClick = (option: ToggleOption) => {
    // If this option maps to a registered sub-view, show it.
    if (option in subViews) {
      setView(option as keyof typeof subViews);
      return;
    }
    // ...handle other options here (navigate, open modal, etc.)
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {view === 'menu' ? (
        <>
          {/* Scrollable toggle options */}
          <div className="flex flex-col gap-1 p-2 overflow-y-auto flex-1">
            {toggleOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionClick(option)}
                className="w-full h-12 md:h-14 grid grid-cols-[20%_80%] overflow-hidden
                  transition-transform duration-300 ease-out hover:translate-x-2
                  cursor-pointer text-left"
              >
                <div className="flex items-center justify-center text-white font-sans">
                  <span className={`fa-solid ${icons[option]}`} />
                </div>
                <div className="flex items-center justify-start text-white font-medium font-sans capitalize">
                  {option}
                </div>
              </button>
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
        </>
      ) : (
        <SidebarSubView
          title={subViews[view].title}
          onBack={() => setView('menu')}
        >
          {(() => {
            const { Component } = subViews[view];
            return <Component />;
          })()}
        </SidebarSubView>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared shell for every sub-view: back button + title + scroll area */
/* ------------------------------------------------------------------ */
type SidebarSubViewProps = {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
};

function SidebarSubView({ title, onBack, children }: SidebarSubViewProps) {
  return (
    <>
      {/* Header with back button */}
      <div className="flex items-center gap-2 p-2 border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full
            text-white transition-transform duration-200 hover:translate-x-[-2px]
            cursor-pointer"
        >
          <span className="fa-solid fa-arrow-left" />
        </button>
        <span className="text-white font-semibold font-sans capitalize">
          {title}
        </span>
      </div>

      {children}
    </>
  );
}