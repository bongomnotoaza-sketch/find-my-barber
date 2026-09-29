import { useState } from "react";
import BarbersFollowing from "./barbersfollowing";
import BookingsList from "./bookings";
import Tickets from "./tickets";
import Refunds from "./refunds";
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
  "refunds",
  "reviews",
  "barbers following",
  "account settings",
  "help",
  "platform policy",
  "refunds policy",
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
  "refund policy",
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
  refunds: "fa-rotate-left",
  reviews: "fa-star",
  "barbers following": "fa-user-group",
  "account settings": "fa-gear",
  help: "fa-circle-question",
  "platform policy": "fa-building-shield",
  "refunds policy": "fa-file-invoice-dollar",
  "privacy policy": "fa-shield-halved",
  // barber
  services: "fa-scissors",
  customers: "fa-users",
  schedule: "fa-clock",
  earnings: "fa-sack-dollar",
  expenses: "fa-receipt",
  "refund policy": "fa-file-invoice-dollar",
};

/* ------------------------------------------------------------------ */
/*  Sub-view registry                                                  */
/*  Add a row here to wire up a new sidebar page.                      */
/* ------------------------------------------------------------------ */

const userSubViews = {
  bookings: { title: "Bookings", Component: BookingsList },
  tickets: { title: "Tickets", Component: Tickets },
  refunds: { title: "Refunds", Component: Refunds },
  "barbers following": { title: "Barbers Following", Component: BarbersFollowing },
  "account settings": { title: "Account Settings", Component: AccountSettings },
} as const;

const barberSubViews = {
  bookings: { title: "Bookings", Component: Bookings },
  "account settings": { title: "Account Settings", Component: AccountSettings },
  earnings: { title: "Earnings", Component: Earnings },
  line: { title: "Line", Component: Line },
  schedule: { title:"Schedule", Component: Schedule },
  services: { title:"Services", Component: Services },
  customers: { title:"Customers", Component: Customers},
  expenses: { title:"Expenses", Component: Expenses }

  // TODO: wire these up when the components exist:
  // services: { title: "Services", Component: ServicesList },
  // customers: { title: "Customers", Component: CustomersList },
  // schedule: { title: "Schedule", Component: ScheduleView },
  // earnings: { title: "Earnings", Component: EarningsView },
  // expenses: { title: "Expenses", Component: ExpensesView },
  // reviews: { title: "Reviews", Component: ReviewsList },
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
  onOpenRefundsPolicy: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
};

export default function SidebarBodyBottom({
  role = "user",
  onSignOut,
  onOpenRefundsPolicy,
  onOpenPrivacyPolicy,
  onOpenTerms,
}: SidebarBodyBottomProps) {
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<SidebarView>("menu");

  const isBarber = role === "barber";
  const options: readonly ToggleOption[] = isBarber ? BARBER_OPTIONS : USER_OPTIONS;

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
    // Policy handoffs — same for both roles
    if (option === "refunds policy" || option === "refund policy") {
      onOpenRefundsPolicy();
      return;
    }
    if (option === "privacy policy") {
      onOpenPrivacyPolicy();
      return;
    }
    if (option === "platform policy") {
      onOpenTerms();
      return;
    }

    // Sub-view routing by role
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

    // Everything else is a no-op for now.
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {view === "menu" ? (
        <>
          {/* Scrollable toggle options */}
          <div className="flex flex-col gap-1 p-2 overflow-y-auto flex-1">
            {options.map((option) => (
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
          {view.kind === "user"
            ? (() => {
                const { Component } = userSubViews[view.key];
                return <Component />;
              })()
            : (() => {
                const { Component } = barberSubViews[view.key];
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