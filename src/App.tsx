import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import BookPopUp from "./components/mainarea/bookpopup";
import Description from "./components/mainarea/description";
import AppFooter from "./components/mainarea/footer";
import MainImage from "./components/mainarea/mainimage";
import MainNav from "./components/mainarea/mainnav";
import OrderSummary from "./components/mainarea/ordersummary";
import BarberScreen from "./components/mainarea/barber";
import BackgroundMusic from "./components/mainarea/backroundmusic";
import CommentsPopUp from "./components/mainarea/comments";

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

type View = "home" | "order-summary" | "barber";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [showBookPopup, setShowBookPopup] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );

  const handleBook = () => {
    if (selectedIndex === undefined) return;
    setShowBookPopup(false);
    setView("order-summary");
  };

  const handleBarberBook = (service: Service) => {
    const index = defaultServices.findIndex((s) => s.name === service.name);
    setSelectedIndex(index >= 0 ? index : undefined);
    setView("order-summary");
  };

  const handleAddComment = (text: string) => {
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), username: "you", text, likes: 0 },
    ]);
  };

  const selectedService =
    selectedIndex !== undefined ? defaultServices[selectedIndex] : undefined;

  return (
    <>
      <BackgroundMusic
        src={MUSIC_SRC}
        volume={0.25}
        loop
        playing={view === "home"}
      />

      {view === "barber" && (
        <BarberScreen
          onBack={() => setView("home")}
          onBook={handleBarberBook}
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
            date="25 September 2026"
            time="14:30"
            barberName="Fresh Cuts"
            total={selectedService?.price ?? ""}
            onPay={(bookingForName) => {
              console.log("Booking for:", bookingForName || "self");
            }}
          />
        </div>
      )}

      {view === "home" && (
        <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
          {/* Background image carousel — fills entire screen */}
          <div className="absolute inset-0">
            <MainImage />
          </div>

          {/* Search icon — top LEFT, orange→red→pink gradient */}
          <motion.button
            type="button"
            aria-label="Search"
            className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
          >
            <Search
              className="h-4.5 w-4.5"
              strokeWidth={2.2}
              style={{ stroke: "url(#search-gradient)" }}
            />
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
          </motion.button>

          {/* Right-side action rail */}
          <MainNav
            likes={120}
            comments={comments.length}
            favourites={45}
            shares={18}
            onUserPress={() => setView("barber")}
            onCommentsPress={() => setShowComments(true)}
          />

          {/* Bottom stack: Description → Footer, floats above image */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col">
            <Description
              username="Fresh Cuts"
              verified
              description="Professional barber specializing in modern cuts, fades, beard grooming and styling."
            />

            <AppFooter onPlusPress={() => setShowBookPopup(true)} />
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