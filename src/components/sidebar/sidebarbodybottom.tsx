import { useState } from "react";
import BarbersFollowing from "./barbersfollowing";
import BookingsList from "./bookings";
import Tickets from "./tickets";
import AccountSettings from "./accountsettings";
import Earnings from "./income";
import Bookings from "./barber_bookings";
import Line from "./line";
import Schedule from "./schedule";
import Services from "./services";
import Customers from "./customers";
import Expenses from "./espenses";

/* ------------------------------------------------------------------ */
/*  Option lists per role                                              */
/* ------------------------------------------------------------------ */

const USER_OPTIONS = [
  "bookings",
  "tickets",
  "barbers following",
  "account settings",
  "help",
  "platform policy",
  "privacy policy",
] as const;

const BARBER_OPTIONS = [
  "line",
  "bookings",
  "services",
  "customers",
  "schedule",
  "earnings",
  "expenses",
  "reviews",
  "account settings",
  "platform policy",
  "privacy policy",
  "help",
] as const;

type UserOption = typeof USER_OPTIONS[number];
type BarberOption = typeof BARBER_OPTIONS[number];
type ToggleOption = UserOption | BarberOption;

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

const icons: Record<ToggleOption, string> = {
  // user
  line: "fa-users",
  bookings: "fa-calendar-check",
  tickets: "fa-ticket",
  reviews: "fa-star",
  "barbers following": "fa-user-group",
  "account settings": "fa-gear",
  help: "fa-circle-question",
  "platform policy": "fa-building-shield",
  "privacy policy": "fa-shield-halved",
  // barber
  services: "fa-scissors",
  customers: "fa-users",
  schedule: "fa-clock",
  earnings: "fa-sack-dollar",
  expenses: "fa-receipt",
};

/* ------------------------------------------------------------------ */
/*  Sub-view registry                                                  */
/* ------------------------------------------------------------------ */

/**
 * Sub-views may receive `isBarber` (AccountSettings uses it to show the
 * barber-only section). Components that don't need it simply ignore it.
 */
type SubViewProps = { isBarber?: boolean };

const userSubViews = {
  bookings: { title: "Bookings", Component: BookingsList },
  tickets: { title: "Tickets", Component: Tickets },
  "barbers following": {
    title: "Barbers Following",
    Component: BarbersFollowing,
  },
  "account settings": { title: "Account Settings", Component: AccountSettings },
} as const;

const barberSubViews = {
  line: { title: "Line", Component: Line },
  bookings: { title: "Bookings", Component: Bookings },
  services: { title: "Services", Component: Services },
  customers: { title: "Customers", Component: Customers },
  schedule: { title: "Schedule", Component: Schedule },
  earnings: { title: "Earnings", Component: Earnings },
  expenses: { title: "Expenses", Component: Expenses },
  "account settings": { title: "Account Settings", Component: AccountSettings },
} as const;

type UserSubViewKey = keyof typeof userSubViews;
type BarberSubViewKey = keyof typeof barberSubViews;
type SidebarView =
  | "menu"
  | { kind: "user"; key: UserSubViewKey }
  | { kind: "barber"; key: BarberSubViewKey };

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

type SidebarBodyBottomProps = {
  role?: "user" | "barber";
  onSignOut: () => void | Promise<void>;
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
};

export default function SidebarBodyBottom({
  role = "user",
  onSignOut,
  onOpenPrivacyPolicy,
  onOpenTerms,
}: SidebarBodyBottomProps) {
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<SidebarView>("menu");

  const isBarber = role === "barber";
  const options: readonly ToggleOption[] = isBarber
    ? BARBER_OPTIONS
    : USER_OPTIONS;

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
    if (option === "privacy policy") {
      onOpenPrivacyPolicy();
      return;
    }
    if (option === "platform policy") {
      onOpenTerms();
      return;
    }

    if (isBarber) {
      if (option in barberSubViews) {
        setView({ kind: "barber", key: option as BarberSubViewKey });
        return;
      }
    } else {
      if (option in userSubViews) {
        setView({ kind: "user", key: option as UserSubViewKey });
        return;
      }
    }
  };

  /* ---------- Render the active sub-view ---------- */

  const renderSubView = () => {
    if (view === "menu") return null;

    if (view.kind === "user") {
      const { Component } = userSubViews[view.key] as {
        Component: React.ComponentType<SubViewProps>;
      };
      return <Component isBarber={false} />;
    }

    const { Component } = barberSubViews[view.key] as {
      Component: React.ComponentType<SubViewProps>;
    };
    return <Component isBarber={true} />;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {view === "menu" ? (
        <>
          {/* Scrollable toggle options */}
          <div className="flex flex-col gap-1 p-2 overflow-y-auto flex-1 min-h-0">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionClick(option)}
                className="w-full h-12 md:h-14 shrink-0 grid grid-cols-[20%_80%] overflow-hidden
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
          <div className="p-2 border-t border-white/20 shrink-0">
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
                    pending ? "fa-spinner fa-spin" : "fa-right-from-bracket"
                  }`}
                />
              </div>
              <div className="flex items-center justify-start text-white font-medium font-sans">
                {pending ? "Signing out…" : "Sign Out"}
              </div>
            </button>
          </div>
        </>
      ) : (
        <SidebarSubView
          title={
            view.kind === "user"
              ? userSubViews[view.key].title
              : barberSubViews[view.key].title
          }
          onBack={() => setView("menu")}
        >
          {renderSubView()}
        </SidebarSubView>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared shell for every sub-view                                    */
/* ------------------------------------------------------------------ */

type SidebarSubViewProps = {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
};

function SidebarSubView({ title, onBack, children }: SidebarSubViewProps) {
  return (
    <>
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