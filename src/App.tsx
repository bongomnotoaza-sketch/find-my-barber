import { useState } from "react";
import { AnimatePresence } from "motion/react";
import BookPopUp from "./components/mainarea/bookpopup";
import CategoryStrip from "./components/mainarea/catergorystrip";
import Description from "./components/mainarea/description";
import AppFooter from "./components/mainarea/footer";
import Header from "./components/mainarea/header";
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
  const [showComments, setShowComments] = useState(false); // NEW
  const [comments, setComments] = useState<Comment[]>([]); // NEW
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

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
      <BackgroundMusic src={MUSIC_SRC} volume={0.25} loop playing={view === "home"} />

      {view === "barber" && (
        <BarberScreen
          onBack={() => setView("home")}
          onBook={handleBarberBook}
        />
      )}

      {view === "order-summary" && (
        <div className="flex flex-col h-screen bg-zinc-950 p-4 overflow-hidden overflow-y-auto">
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
        <div className="relative flex flex-col h-screen bg-zinc-950 overflow-hidden">
          <Header />

          <CategoryStrip />

          <div className="relative h-[80%]">
            <MainImage />

            <Description
              username="Fresh Cuts"
              verified
              description="Professional barber specializing in modern cuts, fades, beard grooming and styling."
            />

            <MainNav
              likes={120}
              comments={comments.length}
              favourites={45}
              shares={18}
              onUserPress={() => setView("barber")}
              onCommentsPress={() => setShowComments(true)}
            />
          </div>

          <AppFooter onPlusPress={() => setShowBookPopup(true)} />

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