import { ChevronLeft } from "lucide-react";
import BarberHeader from "./barberheader";
import BarberStats from "./barberstats";
import MainImage from "./barberimage";
import CreatePost from "./createpost";

type Service = {
  image: string;
  name: string;
  price: number | string;
};

type BarberScreenProps = {
  isBarber?: boolean;
  onBack?: () => void;
  onBook?: (service: Service, date: Date) => void;
  initialServiceIndex?: number;
};

export default function BarberScreen({
  isBarber = false,
  onBack,
  onBook,
  initialServiceIndex,
}: BarberScreenProps) {
  // If the signed-in user is a barber, show the full Create Post screen.
  if (isBarber) {
    return (
      <div className="relative flex flex-col h-screen bg-zinc-950 overflow-hidden">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <CreatePost />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      {/* Header - 10% */}
      <div className="h-[10%] shrink-0">
        <BarberHeader
          username="Barber Name"
          userImage="https://i.pravatar.cc/100"
          verified
          rating={4.8}
          reviewCount={120}
          onBack={onBack}
        />
      </div>

      {/* Image - 30% */}
      <div className="h-[30%] shrink-0">
        <MainImage />
      </div>

      {/* Stats - 60% */}
      <div className="h-[60%] overflow-y-auto">
        <BarberStats
          onBook={onBook}
          initialServiceIndex={initialServiceIndex}
        />
      </div>
    </div>
  );
}