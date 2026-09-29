import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { getCurrentUser, onAuthStateChange, signOut } from "./lib/auth";
import { supabase } from "./lib/superbase";
import { updateProfile } from "./lib/profiles";
import { saveBarberProfile } from "./lib/barber_profiles";
import { useIsBarber } from "./lib/useIsBarber"; // NEW
import BookPopUp from "./components/mainarea/bookpopup";
import Description from "./components/mainarea/description";
import AppFooter from "./components/mainarea/footer";
import MainImage from "./components/mainarea/mainimage";
import MainNav from "./components/mainarea/mainnav";
import OrderSummary from "./components/mainarea/ordersummary";
import BarberScreen from "./components/mainarea/barber";
import BackgroundMusic from "./components/mainarea/backroundmusic";
import CommentsPopUp from "./components/mainarea/comments";
import Login from "./components/mainarea/loginpage";
import Sidebar from "./components/sidebar/sidebar";
import SignUp from "./components/mainarea/signup";
import ProfileSetup from "./components/sidebar/set_profile";
import BarberProfileSetup from "./components/sidebar/barber_set_profile";
import RefundsPolicy from "./components/mainarea/refundspolicy";
import PrivacyPolicy from "./components/mainarea/privacypolicys";
import TermsPolicy from "./components/mainarea/termspolicys";

type Service = {
  image: string;
  name: string;
  price: number | string;
};

type Comment = {
  id: string;
  username: string;
  text: string;
  likes: number;
};

const defaultServices: Service[] = [
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
    name: "Haircut",
    price: 150,
  },
  {
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
    name: "Haircut + Beard",
    price: 200,
  },
  {
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0d4b1f1e",
    name: "Beard Trim",
    price: 80,
  },
];

const MUSIC_SRC = "/kontraa-water-afro-pop-music-445661.mp3";

type View =
  | "home"
  | "order-summary"
  | "barber"
  | "refunds-policy"
  | "privacy-policy"
  | "terms-policy";

type Feed = "barbers" | "general";
type Role = "user" | "barber";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // profile setup gating
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showBarberSetup, setShowBarberSetup] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [pendingRole, setPendingRole] = useState<Role>("user");

  const [view, setView] = useState<View>("home");
  const [activeFeed, setActiveFeed] = useState<Feed>("barbers");
  const [showBookPopup, setShowBookPopup] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // NEW: role detection for sidebar
  const isBarber = useIsBarber(user?.id);

  // Check for an existing session on mount
  useEffect(() => {
    getCurrentUser().then((result) => {
      if (result.success) {
        setUser(result.data);
      }
      setCheckingSession(false);
    });

    const unsubscribe = onAuthStateChange((u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  // Whenever we have a user (or pendingRole changes), decide which setup
  // screen — if any — to show.
  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    setCheckingProfile(true);

    (async () => {
      // 1. Is the base profile complete?
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      const needsProfile = profileErr || !profile?.display_name;

      if (needsProfile) {
        if (pendingRole === "barber") {
          setShowBarberSetup(true);
          setShowProfileSetup(false);
        } else {
          setShowProfileSetup(true);
          setShowBarberSetup(false);
        }
        setCheckingProfile(false);
        return;
      }

      // 2. Base profile is complete → is this a barber account?
      const { data: barber } = await supabase
        .from("barber_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (barber) {
        setShowBarberSetup(false);
        setShowProfileSetup(false);
      } else if (pendingRole === "barber") {
        setShowBarberSetup(true);
        setShowProfileSetup(false);
      } else {
        setShowProfileSetup(false);
        setShowBarberSetup(false);
      }

      setCheckingProfile(false);
    })();
  }, [user, pendingRole]);

  const handleBook = () => {
    if (selectedIndex === undefined) return;
    setShowBookPopup(false);
    setSelectedDate(undefined);
    setView("barber");
  };

  const handleBarberBook = (service: Service, date: Date) => {
    const index = defaultServices.findIndex((s) => s.name === service.name);
    setSelectedIndex(index >= 0 ? index : undefined);
    setSelectedDate(date);
    setView("order-summary");
  };

  const handleAddComment = (text: string) => {
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), username: "you", text, likes: 0 },
    ]);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.success) {
      console.error("Sign out failed:", result.error);
      return;
    }
    setShowSidebar(false);
  };

  const handleOpenRefundsPolicy = () => {
    setShowSidebar(false);
    setView("refunds-policy");
  };

  const handleOpenPrivacyPolicy = () => {
    setShowSidebar(false);
    setView("privacy-policy");
  };

  const handleOpenTerms = () => {
    setShowSidebar(false);
    setView("terms-policy");
  };

  const selectedService =
    selectedIndex !== undefined ? defaultServices[selectedIndex] : undefined;

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate)
    : "";

  if (checkingSession || (user && checkingProfile)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* splash */}
      </div>
    );
  }

  if (!user) {
    if (showSignUp) {
      return (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSignUpSuccess={(role) => {
            setPendingRole(role);
            setShowSignUp(false);
          }}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={() => {}}
        onSignUpPress={() => setShowSignUp(true)}
      />
    );
  }

  // USER profile setup
  if (showProfileSetup) {
    return (
      <ProfileSetup
        onContinue={async (details) => {
          const result = await updateProfile({
            displayName: details.displayName,
            bio: details.bio,
            avatarFile:
              details.avatar.type === "upload" ? details.avatar.file : null,
          });

          if (!result.success) {
            console.error("Profile setup failed:", result.error);
            return;
          }

          setShowProfileSetup(false);
        }}
        onClose={async () => {
          await signOut();
          setShowProfileSetup(false);
        }}
      />
    );
  }

  // BARBER profile setup
  if (showBarberSetup) {
    return (
      <BarberProfileSetup
        onContinue={async (details) => {
          const profileResult = await updateProfile({
            displayName: details.displayName,
            bio: details.bio,
            avatarFile:
              details.avatar.type === "upload" ? details.avatar.file : null,
          });

          if (!profileResult.success) {
            console.error("Profile setup failed:", profileResult.error);
            return;
          }

          const barberResult = await saveBarberProfile({
            shop_name: details.barberProfile.shopName,
            address: details.barberProfile.address,
            account_number: details.barberProfile.accountNumber,
            account_holder: details.barberProfile.accountHolder,
            whatsapp: details.barberProfile.whatsapp,
            phone: details.barberProfile.phone,
            email: details.barberProfile.email,
            instagram: details.barberProfile.instagram,
            facebook: details.barberProfile.facebook,
            twitter: details.barberProfile.twitter,
          });

          if (!barberResult.success) {
            console.error("Barber profile save failed:", barberResult.error);
            return;
          }

          setShowBarberSetup(false);
        }}
        onClose={async () => {
          await signOut();
          setShowBarberSetup(false);
        }}
      />
    );
  }

  return (
    <>
      <BackgroundMusic
        src={MUSIC_SRC}
        volume={0.25}
        loop
        playing={view === "home"}
      />

      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-30 bg-black/50"
            />
            <motion.div
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40"
            >
              <Sidebar
                role={isBarber ? "barber" : "user"}   // NEW
                onSignOut={handleSignOut}
                onOpenRefundsPolicy={handleOpenRefundsPolicy}
                onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                onOpenTerms={handleOpenTerms}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {view === "barber" && (
        <BarberScreen
          isBarber={!!isBarber}  
          onBack={() => setView("home")}
          onBook={handleBarberBook}
          initialServiceIndex={selectedIndex}
        />
      )}

      {view === "order-summary" && (
        <div className="flex flex-col h-dvh bg-zinc-950 p-4 overflow-hidden overflow-y-auto">
          <button
            type="button"
            onClick={() => setView("home")}
            className="text-white mb-4"
          >
            ← Back
          </button>

          <OrderSummary
            serviceName={selectedService?.name ?? ""}
            date={formattedDate}
            time="14:30"
            barberName="Fresh Cuts"
            total={selectedService?.price ?? ""}
            onPay={(bookingForName) => {
              console.log("Booking for:", bookingForName || "self");
            }}
          />
        </div>
      )}

      {view === "refunds-policy" && (
        <RefundsPolicy onBack={() => setView("home")} />
      )}

      {view === "privacy-policy" && (
        <PrivacyPolicy onBack={() => setView("home")} />
      )}

      {view === "terms-policy" && (
        <TermsPolicy onBack={() => setView("home")} />
      )}

      {view === "home" && (
        <div className="relative h-dvh w-full overflow-hidden bg-zinc-950">
          <div className="absolute inset-0">
            <MainImage transition="zoom" />
          </div>

          <div className="absolute inset-x-0 top-3 z-20 h-10">
            <motion.button
              type="button"
              aria-label="Search"
              className="absolute left-3 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
            >
              <Search
                className="h-4.5 w-4.5"
                strokeWidth={2.2}
                style={{ stroke: "url(#search-gradient)" }}
              />
            </motion.button>

            <div className="flex h-full items-center justify-center gap-10">
              {(["barbers", "general"] as const).map((tab) => {
                const isActive = activeFeed === tab;
                const label = tab === "barbers" ? "Your Barbers" : "General";

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFeed(tab)}
                    className="relative pb-1"
                  >
                    <span
                      className={`text-[15px] transition-colors duration-200 ${
                        isActive
                          ? "font-bold text-white"
                          : "font-medium text-white/60"
                      }`}
                    >
                      {label}
                    </span>

                    {isActive && (
                      <motion.span
                        layoutId="feed-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #fb923c 0%, #ef4444 50%, #ec4899 100%)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient
                  id="search-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <MainNav
            likes={120}
            comments={comments.length}
            favourites={45}
            shares={18}
            onUserPress={() => setView("barber")}
            onCommentsPress={() => setShowComments(true)}
          />

          <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col">
            <Description
              username="Fresh Cuts"
              verified
              description="Professional barber specializing in modern cuts, fades, beard grooming and styling."
            />

            <AppFooter
              onPlusPress={() => setShowBookPopup(true)}
              onUserPress={() => setShowSidebar(true)}
            />
          </div>

          <AnimatePresence>
            {showBookPopup && (
              <BookPopUp
                services={defaultServices}
                selectedIndex={selectedIndex}
                onSelect={(index) => setSelectedIndex(index)}
                onBook={handleBook}
                onClose={() => setShowBookPopup(false)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showComments && (
              <CommentsPopUp
                comments={comments}
                onClose={() => setShowComments(false)}
                onAddComment={handleAddComment}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}